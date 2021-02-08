import React from 'react';
import jwt_decode from 'jwt-decode';
import produce from 'immer';
import {
  Entity,
  User,
  Post,
  Comment,
  NormalizedPost,
  NormalizedUser,
} from '../types/entities';
import { request } from '../utils';

const GlobalContext = React.createContext(null);

function indexById(data: Entity[]) {
  return data.reduce((acc, item) => {
    acc[item._id] = item;

    return acc;
  }, {});
}

function findAndReplaceOne<T>(
  array: T[],
  isTarget: (T) => boolean,
  updater: (T) => T
): void {
  let targetIndex = null;
  for (let i = 0; i < array.length; targetIndex == null) {
    if (isTarget(array[i])) {
      targetIndex = i;
    }
  }

  const replacementValue = updater(array[targetIndex]);

  array.splice(targetIndex, 1, replacementValue);
}

const initialValues = {
  votes: {
    posts: {},
    comments: {},
  },
};

export const GlobalProvider: React.FC = (props) => {
  const [user, setUser] = React.useState(null);
  const [votes, setVotes] = React.useState(initialValues.votes);

  // When the app first mounts, check for a token ...
  React.useEffect(() => {
    const token = window.localStorage.getItem('__legenda_token');
    if (token) {
      const decoded: { _id: string; username: string } = jwt_decode(token);
      setUser({ _id: decoded._id, username: decoded.username });

      console.log(`Logged in as ${decoded.username}`);
      loadUserVotes();
    }
  }, []);

  function processIncomingToken(token: string) {
    window.localStorage.setItem('__legenda_token', token);

    const decoded: { _id: string; username: string } = jwt_decode(token);
    setUser({ _id: decoded._id, username: decoded.username });
  }

  async function signup(userDetails) {
    const res = await request<{ token: string }>('auth/signup', {
      body: userDetails,
    });

    processIncomingToken(res.token);
  }

  async function login(userDetails) {
    const res = await request<{ token: string }>('auth/login', {
      body: userDetails,
    });

    processIncomingToken(res.token);
    loadUserVotes();
  }

  function logout() {
    window.localStorage.removeItem('__legenda_token');
    setUser(null);
    setVotes(initialValues.votes);
  }

  async function loadUserVotes(query?: { post?: string; comment?: string }) {
    const endpoint = query
      ? query.post
        ? `vote/user?post=${query.post}`
        : `vote/user?comment=${query.comment}`
      : `vote/user`;

    const res = await request<{
      posts: Record<string, number>[];
      comments: Record<string, number>[];
    }>(endpoint);

    const newVotes = produce(votes, (copy) => {
      copy.posts = { ...copy.posts, ...res.posts };
      copy.comments = {
        ...copy.comments,
        ...res.comments,
      };

      return copy;
    });

    setVotes(newVotes);
  }

  async function loadPosts() {
    // Load all posts
    const posts = await request<Post[]>('post');

    const indexed = indexById(posts);

    return indexed;
  }

  async function loadUserDetails(id: string) {
    const res = await request<User>(`user/${id}`);
    const populateUserField = (entity) => ({
      ...entity,
      user: {
        username: res.username,
        _id: id,
      },
    });

    return {
      user: normalizeUser(res),
      comments: indexById(res.comments.map(populateUserField)),
      posts: indexById(res.posts.map(populateUserField)),
    };
  }

  async function loadPostById(id: string) {
    // Load single post and its comments
    const post = await request<Post>(`post/${id}`);
    const indexedComments = indexById(post.comments);

    // Normalize post object by replacing comments with comment ID's
    const normalizedPost: NormalizedPost = {
      ...post,
      comments: Object.keys(indexedComments),
    };

    return {
      post: normalizedPost,
      comments: indexedComments,
    };
  }

  function loadCommentById(id: string) {
    return request<Comment>(`comment/${id}`);
  }

  async function createComment(options: {
    text: string;
    parent?: string;
    post: string;
  }) {
    try {
      const res: Comment = await request('comment', {
        body: options,
      });

      return res;
    } catch (err) {
      console.log(err);
    }
  }

  async function updateComment(comment_id: string, text: string) {
    try {
      const res: Comment = await request(`comment/${comment_id}`, {
        method: 'put',
        body: {
          text: text,
        },
      });

      return res;
    } catch (err) {
      console.log(err);
    }
  }

  function deleteComment(comment_id: string) {
    try {
      return request(`comment/${comment_id}`, { method: 'delete' });
    } catch (error) {
      console.log(err);
    }
  }

  async function undoVote(
    options: { comment?: string; post?: string },
    cb: (newPoints: number) => void
  ) {
    if (options.comment) {
      const { points: newPoints } = await request('vote', {
        method: 'delete',
        queryParams: { comment: options.comment },
      });

      const id = options.comment;

      setVotes(
        produce(votes, (v) => {
          v.comments[id] = 0;
          return v;
        })
      );

      return cb(newPoints);
    } else {
      const { points: newPoints } = await request('vote', {
        method: 'delete',
        queryParams: { post: options.post },
      });

      const id = options.post;

      setVotes(
        produce(votes, (v) => {
          v.posts[id] = 0;
          return v;
        })
      );
      return cb(newPoints);
    }
  }
  async function vote(
    options: {
      comment?: string;
      post?: string;
      isUpvote: boolean;
    },
    cb: (newPoints: number) => void
  ) {
    try {
      const entity = options.comment ? 'comment' : 'post';
      const id = options.comment || options.post;

      const { points: newPoints } = await request<{ points: number }>(
        `vote/${entity}/${id}`,
        {
          method: 'post',
          queryParams: { isUpvote: String(options.isUpvote) },
        }
      );

      const newVotes = produce(votes, (v) => {
        v[entity + 's'][id] = options.isUpvote ? 1 : -1;
      });

      setVotes(newVotes);

      return cb(newPoints);
    } catch (error) {
      console.log(error);
    }
  }

  const ctx = {
    // Auth
    user,
    votes,
    login,
    signup,
    logout,

    populateComments: (comments) => {
      return produce(comments, (populated) => {
        // Populate children of comments
        for (const id in populated) {
          populated[id].children = [];
        }
        for (const id in populated) {
          const parent = populated[id].parent;
          if (parent && populated[parent]) {
            populated[parent].children.push(populated[id]);
          }
        }

        return populated;
      });
    },

    // Data fetching
    loadUserVotes,
    loadUserDetails,
    loadPosts,
    loadPostById,
    loadCommentById,

    // Creating, Updating, Deleting
    createComment,
    updateComment,
    deleteComment,
    vote,
    undoVote,
  };

  return (
    <GlobalContext.Provider value={ctx}>
      {props.children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  return React.useContext(GlobalContext);
};

function normalizeUser(user: User): NormalizedUser {
  return {
    ...user,
    comments: user.comments.map((c: Comment) => c._id),
    posts: user.posts.map((p: Post) => p._id),
  };
}
