import { useRouter } from 'next/router';
import Link from 'next/link';
import { css } from '@emotion/core';
import { useTheme } from '@emotion/react';
import { Tabs } from 'antd';
import useSWR from 'swr';

import { useGlobal } from '../../store';
import Layout from '../../components/Layout';
import PostContainer from '../../components/PostContainer';
import CommentContainer from '../../components/CommentContainer';

const { TabPane } = Tabs;

const UserView: React.FC = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const {
    user,
    users,
    posts,
    comments,
    loadUserDetails,
    votes,
    vote,
    undoVote,
    updateComment,
    deleteComment,
  } = useGlobal();

  React.useEffect(() => {
    loadUserDetails(user_id);
  }, [user_id]);

  const targetUser = users && users[user_id];

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
                  {targetUser.posts.map((post_id) => {
                    const p = posts[post_id];

                    if (p === undefined) return 'Loading...';

                    const voteProps = {
                      userVote: votes.posts[p._id] || 0,
                      onClickUpVote:
                        votes.posts[p._id] === 1
                          ? (id: string) => undoVote({ post: id })
                          : (id: string) => vote({ post: id, isUpvote: true }),
                      onClickDownVote:
                        votes.posts[p._id] === -1
                          ? (id: string) => undoVote({ post: id })
                          : (id: string) => vote({ post: id, isUpvote: false }),
                    };

                    <PostContainer post={p} key={p._id} {...voteProps} />;
                  })}
                </TabPane>
                <TabPane tab="Comments" key="2">
                  {targetUser.comments.map((comment_id) => {
                    const c = comments[comment_id];

                    if (c === undefined) {
                      return 'Loading...';
                    }

                    const voteProps = {
                      userVote: votes.comments[c._id] || 0,
                      onClickUpVote:
                        votes.comments[c._id] === 1
                          ? (id: string) => undoVote({ comment: id })
                          : (id: string) =>
                              vote({ comment: id, isUpvote: true }),
                      onClickDownVote:
                        votes.comments[c._id] === -1
                          ? (id: string) => undoVote({ comment: id })
                          : (id: string) =>
                              vote({ comment: id, isUpvote: false }),
                    };
                    return (
                      <CommentContainer
                        key={c._id}
                        comment={c}
                        onEditFinish={updateComment}
                        onClickDelete={deleteComment}
                        ownedByUser={user && c.user._id === user._id}
                        indent={0}
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
