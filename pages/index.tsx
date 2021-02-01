import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { css } from '@emotion/core';
import useSWR from 'swr';

import { User, Post, Comment } from '../../types/entities';
import { useGlobal } from '../store';
import Navbar from '../components/Navbar';
import VoteButtons from '../components/VoteButtons';
import UserLink from '../components/UserLink';
import PostContainer from '../components/PostContainer';
import Layout from '../components/Layout';

export default function Home(): React.ReactNode {
  const { votes, vote, undoVote, loadPosts, posts } = useGlobal();

  React.useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Navbar />
        <Layout.Content>
          {posts ? (
            Object.values(posts).map((post) => {
              const userVote = votes.posts[post._id] || 0;

              return (
                <PostContainer
                  key={post._id}
                  post={post}
                  userVote={userVote}
                  onClickUpVote={
                    userVote === 1
                      ? (id) => undoVote({ post: id })
                      : (id) => vote({ post: id, isUpvote: true })
                  }
                  onClickDownVote={
                    userVote === -1
                      ? (id) => undoVote({ post: id })
                      : (id) => vote({ post: id, isUpvote: false })
                  }
                />
              );
            })
          ) : (
            <Layout.Block>Loading...</Layout.Block>
          )}
        </Layout.Content>
      </Layout>
    </div>
  );
}
