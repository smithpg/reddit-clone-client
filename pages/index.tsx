import React from 'react';
import Head from 'next/head';
import { css } from '@emotion/core';
import { Select } from 'antd';

import { Post } from '../types/entities';
import { useGlobal } from '../store';
import PostContainer from '../components/PostContainer';
import Layout from '../components/Layout';

const UPVOTES_DESCENDING = 'UPVOTES_DESCENDING';
const UPVOTES_ASCENDING = 'UPVOTES_ASCENDING';
const NEWEST_FIRST = 'NEWEST_FIRST';

const sortFunctions = {
  NEWEST_FIRST: (postA: Post, postB: Post) => {
    return Date.parse(postA.createdAt) < Date.parse(postB.createdAt) ? 1 : -1;
  },
  UPVOTES_DESCENDING: (postA: Post, postB: Post) => {
    return postA.points > postB.points ? -1 : 1;
  },
  UPVOTES_ASCENDING: (postA: Post, postB: Post) => {
    return postA.points < postB.points ? -1 : 1;
  },
};

export default function Home(): React.ReactNode {
  const { votes, vote, undoVote, loadPosts } = useGlobal();
  const [posts, setPosts] = React.useState(null);
  const [sortFn, setSortFn] = React.useState<string>(UPVOTES_DESCENDING);

  React.useEffect(() => {
    loadPosts().then((posts) => {
      setPosts(posts);
    });
  }, []);

  const sortedPosts = posts && Object.values(posts).sort(sortFunctions[sortFn]);

  return (
    <>
      <Layout.Block
        css={css`
          display: flex;
          align-items: center;

          h3 {
            margin-right: 4px;
          }
        `}
      >
        <h3>Sort By</h3>
        <Select
          defaultValue={UPVOTES_DESCENDING}
          style={{ width: 120 }}
          onChange={(value) => setSortFn(value)}
        >
          <Select.Option value={UPVOTES_DESCENDING}>Top</Select.Option>
          <Select.Option value={UPVOTES_ASCENDING}>Worst</Select.Option>
          <Select.Option value={NEWEST_FIRST}>New</Select.Option>
        </Select>
      </Layout.Block>
      <Layout.Block>
        {posts ? (
          sortedPosts.map((post: Post) => {
            const userVote = votes.posts[post._id] || 0;
            const updatePostPoints = (newPoints) => {
              setPosts((p) => ({
                ...p,
                [post._id]: { ...post, points: newPoints },
              }));
            };

            return (
              <PostContainer
                key={post._id}
                post={post}
                userVote={userVote}
                onClickUpVote={
                  userVote === 1
                    ? (id) => undoVote({ post: id }, updatePostPoints)
                    : (id) =>
                        vote({ post: id, isUpvote: true }, updatePostPoints)
                }
                onClickDownVote={
                  userVote === -1
                    ? (id) => undoVote({ post: id }, updatePostPoints)
                    : (id) =>
                        vote({ post: id, isUpvote: false }, updatePostPoints)
                }
              />
            );
          })
        ) : (
          <Layout.Block>Loading...</Layout.Block>
        )}
      </Layout.Block>
    </>
  );
}
