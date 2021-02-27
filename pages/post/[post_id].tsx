import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { css } from '@emotion/core';
import { useTheme } from '@emotion/react';
import { Form, Input, Button, Typography } from 'antd';
import useSWR, { mutate } from 'swr';

import { useWindowSize } from '../../hooks';
import { useGlobal } from '../../store';
import request from '../../utils/API';
import Layout from '../../components/Layout';
import Navbar from '../../components/Navbar';
import DateTime from '../../components/DateTime';
import CommentContainer from '../../components/CommentContainer';
import VoteButtons from '../../components/VoteButtons';
import UserLink from '../../components/UserLink';
import CommentForm from '../../components/CommentForm';
import IndentBox from '../../components/IndentBox';

const PostView: React.FC = () => {
  const router = useRouter();
  const post_id: string = router.query.post_id as string;
  const {
    user,
    votes,
    vote,
    undoVote,
    populateComments,
    loadPostById,
    createComment,
    updateComment,
    deleteComment,
  } = useGlobal();
  const { navbarHeight } = useTheme() as Record<string, any>;
  const { width: screenWidth } = useWindowSize();
  const [post, setPost] = React.useState(null);
  const [isEditingPost, setIsEditingPost] = React.useState(false);
  const [editPostForm] = Form.useForm();
  const [comments, setComments] = React.useState([]);
  const [activeComments, setActiveComments] = React.useState({});

  const userOwnsPost = user?._id === post?.user._id;

  React.useEffect(() => {
    if (post_id) {
      loadPostById(post_id).then(({ post, comments }) => {
        setPost(post);
        setComments(comments);
      });
    }
  }, [post_id]);

  React.useEffect(() => {
    if (isEditingPost) {
      editPostForm.setFieldsValue({ text: post.text });
    }
  }, [isEditingPost]);

  const commentTree = React.useMemo(() => {
    // if the post and its comments have been
    // loaded
    console.log('rebuilding commentTree');
    if (post && comments) {
      const populated = populateComments(comments);

      return Object.keys(comments)
        .map((id) => populated[id])
        .filter((c) => c && !c.parent);
    } else return [];
  }, [comments, post]);

  const triggerAuth = () => {
    router.push(`/auth?redirect=${router.asPath}`);
  };

  const triggerComment = (parent_id: string) => {
    // Trigger authentication if necessary
    if (!user) {
      triggerAuth();
    } else {
      setActiveComments((r) => ({ ...r, [parent_id || 'ROOT']: true }));
    }
  };

  const getIsReplying = (comment_id: string) => activeComments[comment_id];

  const cancelComment = (parent_id?: string) => {
    setActiveComments((r) => ({ ...r, [parent_id || 'ROOT']: false }));
  };

  const submitComment = async (text: string, parent_id?: string) => {
    const newComment = await createComment({
      text,
      parent: parent_id,
      post: post_id,
    });

    const newComments = { ...comments, [newComment._id]: newComment };
    console.log(`newComments = `);
    console.log(newComments);

    setComments(newComments);
    setActiveComments((r) => ({ ...r, [parent_id || 'ROOT']: false }));
  };

  const onDeleteComment = (id: string) => {
    return deleteComment(id).then(() => {
      const newComments = { ...comments };
      delete newComments[id];
      setComments(newComments);
    });
  };

  const onUpdateComment = (id: string, newText: string) => {
    return updateComment(id, newText).then((newComment) => {
      setComments({ ...comments, [id]: newComment });
    });
  };

  const deletePost = async () => {
    await request(`post/${post_id}`, { method: 'DELETE' });

    setPost((p) => ({ ...p, text: '[DELETED]' }));
  };

  const updatePost = async (text) => {
    await request(`post/${post_id}`, {
      method: 'PUT',
      body: { text },
    });

    setPost((p) => ({ ...p, text: text }));
  };

  const updatePostPoints = (newPoints) => {
    setPost({ ...post, points: newPoints });
  };

  const renderCommentTree = () => {
    try {
      const elements = [];

      const renderComment = (c, indent = 0) => {
        const updateCommentPoints = (newPoints) => {
          setComments({ ...comments, [c._id]: { ...c, points: newPoints } });
        };
        const voteProps = {
          userVote: votes.comments[c._id] || 0,
          onClickUpVote:
            votes.comments[c._id] === 1
              ? (id: string) => undoVote({ comment: id }, updateCommentPoints)
              : (id: string) =>
                  vote({ comment: id, isUpvote: true }, updateCommentPoints),
          onClickDownVote:
            votes.comments[c._id] === -1
              ? (id: string) => undoVote({ comment: id }, updateCommentPoints)
              : (id: string) =>
                  vote({ comment: id, isUpvote: false }, updateCommentPoints),
        };

        if (indent > 0) {
          elements.push(
            <IndentBox level={indent} borderColor={'#333'}>
              <CommentContainer
                key={c._id}
                comment={c}
                triggerReply={triggerComment}
                onEditFinish={onUpdateComment}
                onClickDelete={onDeleteComment}
                ownedByUser={user && c.user._id === user._id}
                {...voteProps}
              />
            </IndentBox>
          );
        } else {
          elements.push(
            <CommentContainer
              key={c._id}
              comment={c}
              triggerReply={triggerComment}
              onEditFinish={onUpdateComment}
              onClickDelete={onDeleteComment}
              ownedByUser={user && c.user._id === user._id}
              {...voteProps}
            />
          );
        }

        if (getIsReplying(c._id)) {
          elements.push(
            <div
              css={css`
                margin-left: ${indent}rem;
                padding: 4px 8px;
                box-shadow: 0 0 10px -5px rgba(0, 0, 0, 0.3);
              `}
            >
              <h3>Replying to {comments[c._id].user.username}</h3>
              <CommentForm
                key={`${c._id}_reply`}
                parent_id={c._id}
                submitComment={submitComment}
                cancelComment={cancelComment}
              />
            </div>
          );
        }

        if (c.children.length > 0) {
          c.children.forEach((child) => renderComment(child, indent + 1));
        }
      };

      commentTree.forEach((c) => renderComment(c));

      console.log(commentTree);
      console.log(elements);

      return elements;
    } catch (err) {
      console.log(err);
      console.log(comments.filter((c) => !c.parent));
    }
  };

  return post ? (
    <>
      <Layout.Block
        css={css`
          position: sticky;
          z-index: 2;
          top: ${navbarHeight}px;
          background: white;
          display: flex;
          align-items: center;
        `}
      >
        <VoteButtons
          onClickUpVote={
            votes.posts[post_id] === 1
              ? () => undoVote({ post: post_id }, updatePostPoints)
              : () => vote({ post: post_id, isUpvote: true }, updatePostPoints)
          }
          onClickDownVote={
            votes.posts[post_id] === -1
              ? () => undoVote({ post: post_id }, updatePostPoints)
              : () => vote({ post: post_id, isUpvote: false }, updatePostPoints)
          }
          userVote={votes.posts[post._id]}
          value={post.points}
        />
        <div
          css={css`
            margin-left: 12px;
          `}
        >
          <Typography.Title
            level={screenWidth > 500 ? 2 : 4}
            css={css`
              margin: 0px !important;
              flex-grow: 1;
            `}
          >
            {post.title}{' '}
          </Typography.Title>
          <UserLink user={post.user} />
        </div>
      </Layout.Block>
      <Layout.Block>
        {isEditingPost ? (
          <Form
            form={editPostForm}
            onFinish={async ({ text }) => {
              await updatePost(text);
              setIsEditingPost(false);
            }}
          >
            <Form.Item name="text">
              <Input.TextArea />
            </Form.Item>
          </Form>
        ) : (
          post.text
        )}
      </Layout.Block>
      {userOwnsPost ? (
        <Layout.Block
          css={css`
            display: flex;
          `}
        >
          <Button onClick={deletePost}>Delete</Button>
          <Button
            onClick={
              isEditingPost
                ? () => {
                    editPostForm.submit();
                  }
                : () => {
                    setIsEditingPost(true);
                  }
            }
          >
            {isEditingPost ? 'Submit' : 'Edit'}
          </Button>
          {isEditingPost ? (
            <Button onClick={() => setIsEditingPost(false)}>Cancel</Button>
          ) : null}
        </Layout.Block>
      ) : null}
      <Layout.Block>
        <hr></hr>
      </Layout.Block>
      <Layout.Block
        css={css`
          margin-top: 12px;
          margin-bottom: 12px;
        `}
      >
        {user ? (
          <>
            <h3>Leave a Comment as {user.username}</h3>
            <CommentForm
              submitComment={submitComment}
              cancelComment={cancelComment}
              showCancelButton={false}
            />
          </>
        ) : (
          <Button onClick={triggerAuth}>Login to Comment</Button>
        )}
      </Layout.Block>
      <Layout.Block>{renderCommentTree()}</Layout.Block>
    </>
  ) : (
    <Layout.Block>Loading...</Layout.Block>
  );
};

export default PostView;
