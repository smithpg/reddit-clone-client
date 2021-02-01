import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { css } from '@emotion/core';
import { useTheme } from '@emotion/react';
import { Form, Input, Button, Typography } from 'antd';
import useSWR, { mutate } from 'swr';

import { User, Post, Comment } from '../../types/entities';
import { useWindowSize } from '../../hooks';
import { useGlobal, usePost } from '../../store';
import Layout from '../../components/Layout';
import Navbar from '../../components/Navbar';
import DateTime from '../../components/DateTime';
import CommentContainer from '../../components/CommentContainer';
import VoteButtons from '../../components/VoteButtons';
import UserLink from '../../components/UserLink';
import CommentForm from '../../components/CommentForm';
import IndentBox from '../../components/IndentBox';
import { request } from '../../utils';

const PostView: React.FC = () => {
  const router = useRouter();
  const post_id: string = router.query.post_id;
  const {
    user,
    votes,
    vote,
    undoVote,
    posts,
    comments,
    populateComments,
    loadPostById,
    createComment,
    updateComment,
    deleteComment,
  } = useGlobal();
  const { navbarHeight } = useTheme();
  const { width: screenWidth } = useWindowSize();
  const [activeComments, setActiveComments] = React.useState({});

  React.useEffect(() => {
    if (post_id) {
      loadPostById(post_id);
    }
  }, [post_id]);

  const post = posts && posts[post_id];

  const commentTree = React.useMemo(() => {
    // if the post and its comments have been
    // loaded
    if (post && comments && comments[post.comments[0]]) {
      const populated = populateComments(comments);

      return post.comments
        .map((id) => populated[id])
        .filter((c) => c && !c.parent);
    } else return [];
  }, [comments, posts]);

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
    await createComment({ text, parent: parent_id, post: post_id });
    setActiveComments((r) => ({ ...r, [parent_id || 'ROOT']: false }));
  };

  const renderCommentTree = () => {
    try {
      const elements = [];

      const renderComment = (c, indent = 0) => {
        const voteProps = {
          userVote: votes.comments[c._id] || 0,
          onClickUpVote:
            votes.comments[c._id] === 1
              ? (id: string) => undoVote({ comment: id })
              : (id: string) => vote({ comment: id, isUpvote: true }),
          onClickDownVote:
            votes.comments[c._id] === -1
              ? (id: string) => undoVote({ comment: id })
              : (id: string) => vote({ comment: id, isUpvote: false }),
        };

        if (indent > 0) {
          elements.push(
            <IndentBox level={indent} borderColor={'#333'}>
              <CommentContainer
                key={c._id}
                comment={c}
                triggerReply={triggerComment}
                isReplying={getIsReplying(c._id)}
                onEditFinish={updateComment}
                onClickDelete={deleteComment}
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
              isReplying={getIsReplying(c._id)}
              onEditFinish={updateComment}
              onClickDelete={deleteComment}
              ownedByUser={user && c.user._id === user._id}
              indent={indent}
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

  return (
    <Layout>
      <Navbar />
      <Layout.Content>
        {post ? (
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
                    ? () => undoVote({ post: post_id })
                    : () => vote({ post: post_id, isUpvote: true })
                }
                onClickDownVote={
                  votes.posts[post_id] === -1
                    ? () => undoVote({ post: post_id })
                    : () => vote({ post: post_id, isUpvote: false })
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
            <Layout.Block>{post.text}</Layout.Block>
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
        )}
      </Layout.Content>
    </Layout>
  );
};

export default PostView;
