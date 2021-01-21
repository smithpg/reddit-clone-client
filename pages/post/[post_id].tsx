import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { css } from '@emotion/core';
import { useTheme } from '@emotion/react';
import { Form, Input, Button, Typography } from 'antd';
import useSWR, { mutate } from 'swr';

import { User, Post, Comment } from '../../types/entities';
import { useScreenWidth } from '../../hooks';
import { useAuth } from '../../store';
import Layout from '../../components/Layout/Layout';
import DateTime from '../../components/DateTime';
import { request } from '../../utils';

const CommentContext = React.createContext(null);

interface CommentFormProps {
  parent_id?: string;
  showCancelButton?: boolean;
}
const CommentForm: React.FC<CommentFormProps> = ({
  parent_id,
  showCancelButton = true,
  ...props
}) => {
  const { submitComment, cancelComment } = React.useContext(CommentContext);

  return (
    <Form
      onFinish={(values) => submitComment(values.text, parent_id)}
      {...props}
    >
      <Form.Item name="text">
        <Input.TextArea />
      </Form.Item>
      <Button htmlType="submit">Submit</Button>
      {showCancelButton && (
        <Button onClick={() => cancelComment(parent_id)}>Cancel</Button>
      )}
    </Form>
  );
};

interface CommentContainerProps {
  indent?: boolean;
  comment: Comment;
}
const CommentContainer: React.FC<CommentContainerProps> = ({
  indent = false,
  comment,
}) => {
  const { isReplying, triggerComment } = React.useContext(CommentContext);

  return (
    <div
      css={css`
        margin-left: ${indent ? 1 : 0}rem;
        padding: 6px;
        padding-bottom: 12px;
        border-left: 1px solid rgba(0, 0, 0, 0.2);
      `}
    >
      <div>
        <strong>{comment.user.username}</strong>
        <DateTime
          ISOString={comment.createdAt}
          css={css`
            margin-left: 6px;
            color: rgba(0, 0, 0, 0.5);
          `}
        />
      </div>
      <div>{comment.text}</div>
      {isReplying(comment._id) ? (
        <>
          <CommentForm
            parent_id={comment._id}
            css={css`
              margin-left: 1rem;
              padding: 6px;
              padding-bottom: 12px;
            `}
          />
        </>
      ) : (
        <div
          css={css`
            margin: 6px 0px;
          `}
          onClick={() => triggerComment(comment._id)}
        >
          Reply
        </div>
      )}
      {comment.children.map((c) => (
        <CommentContainer key={c._id} indent comment={c} />
      ))}
    </div>
  );
};

interface UserLinkProps {
  username: string;
  id: string;
}
const UserLink: React.FC<UserLinkProps> = (props) => (
  <Link href={`/user/${props.id}`}>{props.username}</Link>
);

const PostView: React.FC = () => {
  const router = useRouter();
  const { post_id } = router.query;
  const { user } = useAuth();
  const { navbarHeight } = useTheme();
  const screenWidth = useScreenWidth();
  const { data, error } = useSWR(`post/${post_id}`);
  const [activeComments, setActiveComments] = React.useState({});

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

  const isReplying = (comment_id: string) => activeComments[comment_id];

  const cancelComment = (parent_id?: string) => {
    setActiveComments((r) => ({ ...r, [parent_id || 'ROOT']: false }));
  };

  const submitComment = async (text: string, parent_id?: string) => {
    const body = {
      text,
      post: router.query.post_id,
    };
    if (parent_id) {
      body.parent = parent_id;
    }

    await request('comment', {
      body,
    });

    setActiveComments((r) => ({ ...r, [parent_id || 'ROOT']: false }));

    mutate(`post/${router.query.post_id}`);
  };

  const ctx = {
    submitComment,
    triggerComment,
    cancelComment,
    isReplying,
  };

  const commentsById = React.useMemo(
    () =>
      data?.comments.reduce((acc, c) => {
        acc[c._id] = c;
        return acc;
      }, {}),
    [data]
  );

  const populateChildren = (comment) => {
    if (comment.children.length > 0) {
      comment.children = comment.children.map((c_id) =>
        populateChildren(commentsById[c_id])
      );
    }

    return comment;
  };

  const commentTree = React.useMemo(() => {
    return data?.comments
      .filter((c) => c && !c.parent)
      .sort((c1, c2) => Date.parse(c1.createdAt) < Date.parse(c2.createdAt))
      .map(populateChildren);
  }, [data]);

  const renderComments = (comments) => {
    try {
      return commentTree.map((c) => (
        <CommentContainer key={c._id} comment={c} />
      ));
    } catch (err) {
      console.log(err);
      console.log(comments.filter((c) => !c.parent));
    }
  };

  return (
    <Layout>
      <Layout.Navbar
        logo={
          <Link href="/">
            <h1>Legenda</h1>
          </Link>
        }
      />
      <Layout.Content>
        {data ? (
          <>
            <Layout.Block
              css={css`
                position: sticky;
                z-index: 999;
                top: ${navbarHeight}px;
                background: white;
                display: flex;
                justify-content: space-between;
                align-items: center;

                @media (max-width: 450px) {
                  flex-direction: column;
                  align-items: flex-start;
                }
              `}
            >
              <Typography.Title
                level={screenWidth > 500 ? 2 : 4}
                css={css`
                  margin: 0px !important;
                `}
              >
                {data.title}{' '}
              </Typography.Title>
              <UserLink username={data.user.username} id={data.user._id} />
            </Layout.Block>
            <Layout.Block>{data.text}</Layout.Block>
            <CommentContext.Provider value={ctx}>
              <Layout.Block
                css={css`
                  margin-top: 12px;
                  margin-bottom: 12px;
                `}
              >
                {user ? (
                  <>
                    <h3>Leave a Comment as {user}</h3>
                    <CommentForm showCancelButton={false} />
                  </>
                ) : (
                  <Button onClick={triggerAuth}>Login to Comment</Button>
                )}
              </Layout.Block>
              <Layout.Block>{renderComments(data.comments)}</Layout.Block>
            </CommentContext.Provider>
          </>
        ) : (
          <Layout.Block>Loading...</Layout.Block>
        )}
      </Layout.Content>
    </Layout>
  );
};

export default PostView;
