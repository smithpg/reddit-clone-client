import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { css } from '@emotion/core';
import { useTheme } from '@emotion/react';
import { Tabs } from 'antd';
import useSWR from 'swr';

import { useGlobal } from '../../store';
import { Post, User, Comment } from '../../types/entities';
import Layout from '../../components/Layout';
import PostContainer from '../../components/PostContainer';
import CommentContainer from '../../components/CommentContainer';

const { TabPane } = Tabs;

const UserView: React.FC = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const {
    user,
    loadUserDetails,
    votes,
    vote,
    undoVote,
    updateComment,
    deleteComment,
  } = useGlobal();

  React.useEffect(() => {
    loadUserDetails(user_id).then(({ user, posts, comments }) => {
      setTargetUser(user);
      setPosts(posts);
      setComments(comments);
    });
  }, [user_id]);

  const [targetUser, setTargetUser] = React.useState(null);
  const [posts, setPosts] = React.useState({});
  const [comments, setComments] = React.useState({});

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
        {targetUser ? (
          <>
            <Layout.Block>
              <h2>{targetUser.username}</h2>
            </Layout.Block>
            <Layout.Block>
              <Tabs defaultActiveKey="1">
                <TabPane tab="Posts" key="1">
                  {posts &&
                    Object.values(posts).map((p: Post) => {
                      const updatePostPoints = (newPoints) => {
                        setPosts({
                          ...posts,
                          [p._id]: { ...p, points: newPoints },
                        });
                      };

                      const voteProps = {
                        userVote: votes.posts[p._id] || 0,
                        onClickUpVote:
                          votes.posts[p._id] === 1
                            ? (id: string) =>
                                undoVote({ post: id }, updatePostPoints)
                            : (id: string) =>
                                vote(
                                  { post: id, isUpvote: true },
                                  updatePostPoints
                                ),
                        onClickDownVote:
                          votes.posts[p._id] === -1
                            ? (id: string) =>
                                undoVote({ post: id }, updatePostPoints)
                            : (id: string) =>
                                vote(
                                  { post: id, isUpvote: false },
                                  updatePostPoints
                                ),
                      };

                      return (
                        <PostContainer post={p} key={p._id} {...voteProps} />
                      );
                    })}
                </TabPane>
                <TabPane tab="Comments" key="2">
                  {Object.values(comments).map((c: Comment) => {
                    const updateCommentPoints = (newPoints) => {
                      setComments({
                        ...comments,
                        [c._id]: { ...c, points: newPoints },
                      });
                    };
                    const voteProps = {
                      userVote: votes.comments[c._id] || 0,
                      onClickUpVote:
                        votes.comments[c._id] === 1
                          ? (id: string) =>
                              undoVote({ comment: id }, updateCommentPoints)
                          : (id: string) =>
                              vote(
                                { comment: id, isUpvote: true },
                                updateCommentPoints
                              ),
                      onClickDownVote:
                        votes.comments[c._id] === -1
                          ? (id: string) =>
                              undoVote({ comment: id }, updateCommentPoints)
                          : (id: string) =>
                              vote(
                                { comment: id, isUpvote: false },
                                updateCommentPoints
                              ),
                    };
                    return (
                      <CommentContainer
                        key={c._id}
                        comment={c}
                        onEditFinish={updateComment}
                        onClickDelete={deleteComment}
                        ownedByUser={user && c.user === user._id}
                        {...voteProps}
                      />
                    );
                  })}
                </TabPane>
              </Tabs>
            </Layout.Block>
          </>
        ) : (
          <Layout.Block>Loading...</Layout.Block>
        )}
      </Layout.Content>
    </Layout>
  );
};

export default UserView;
