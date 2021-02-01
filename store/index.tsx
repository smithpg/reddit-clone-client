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
  const [users, setUsers] = React.useState({});
  const [posts, setPosts] = React.useState({});
  const [comments, setComments] = React.useState({});
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

    setPosts(indexed);
  }

  async function loadUserDetails(id: string) {
    const res = await request<User>(`user/${id}`);

    const newPosts = produce(posts, (posts) =>
      Object.assign(posts, indexById(res.posts))
    );
    const newComments = produce(comments, (comments) => {
      res.comments.forEach(
        (c) => (c.user = { username: res.username, _id: id })
      );
      return Object.assign(comments, indexById(res.comments));
    });

    console.log(newComments);

    const user = normalizeUser(res);

    setPosts(newPosts);
    setComments(newComments);
    setUsers((u) => ({ ...u, [id]: user }));
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

    setComments((c) => ({ ...c, ...indexedComments }));
    setPosts((p) => ({ ...p, [id]: normalizedPost }));
  }

  async function loadCommentById(id: string) {
    const comment = await request<Comment>(`comment/${id}`);

    setComments((c) => ({ ...c, [id]: comment }));
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

      const newPosts = produce(posts, (newPosts) => {
        newPosts[options.post].comments.push(res._id);

        return newPosts;
      });

      const newComments = produce(comments, (newComments) => {
        newComments[res._id] = res;
        return newComments;
      });

      setComments(newComments);
      setPosts(newPosts);
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

      setComments((c) => ({ ...c, [comment_id]: res }));
    } catch (err) {
      console.log(err);
    }
  }

  async function deleteComment(comment_id: string) {
    try {
      const post = comments[comment_id].post;

      await request(`comment/${comment_id}`, { method: 'delete' });

      const newPost = produce(posts[post], (p) => {
        p.comments = p.comments.filter((c) => c !== comment_id);
        return p;
      });

      const newComments = produce(comments, (c) => {
        delete c[comment_id];
        return c;
      });

      setPosts((p) => ({ ...p, [post]: newPost }));
      setComments(newComments);
    } catch (error) {
      console.log(err);
    }
  }

  async function undoVote(options: { comment?: string; post?: string }) {
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

      setComments((c) => ({
        ...c,
        [id]: {
          ...c[id],
          points: newPoints,
        },
      }));
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

      setPosts((p) => ({
        ...p,
        [id]: {
          ...p[id],
          points: newPoints,
        },
      }));
    }
  }
  async function vote(options: {
    comment?: string;
    post?: string;
    isUpvote: boolean;
  }) {
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

      if (entity === 'post') {
        setPosts((p) => ({
          ...p,
          [id]: {
            ...p[id],
            points: newPoints,
          },
        }));
      } else {
        setComments((c) => ({
          ...c,
          [id]: {
            ...c[id],
            points: newPoints,
          },
        }));
      }

      setVotes(newVotes);
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

    // Data
    users,
    posts,
    comments,
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
// export const usePost = (post_id: string) => {
//   const global = React.useContext(GlobalContext);

//   React.useEffect(() => {
//     if (data) {
//       setPost(data);
//     }
//   }, [data]);

//   const commentTree = React.useMemo(() => {
//     if (post) {
//       const populated: Comment[] = produce<Comment[]>(post.comments, (copy) => {
//         const commentsById = indexById(copy);

//         copy.forEach((c) => {
//           if (!c.children) {
//             c.children = [];
//           }
//         });

//         copy.forEach((c) => {
//           if (c.parent) {
//             commentsById[c.parent].children.push(c);
//           }
//         });

//         return copy;
//       });

//       return populated.filter((c) => !c.parent);
//     }
//   }, [post]);

//   return {
//     error,
//     post: post && {
//       ...post,
//       comments: commentTree,
//     },
//     createComment,
//     updateComment,
//     deleteComment,
//     vote,
//     undoVote,
//   };
// };
