import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { css } from '@emotion/core';
import useSWR from 'swr';

import { useAuth } from '../store';
import Layout from '../components/Layout/Layout';

export default function Home(): React.ReactNode {
  const { data, error } = useSWR('post');
  const { user } = useAuth();

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Layout.Navbar logo={<h1>Legenda</h1>}>
          <Link href="/new">
            <a>+ Create a Post</a>
          </Link>
        </Layout.Navbar>
        <Layout.Content>
          {data ? (
            data.map((post) => <Post key={post._id} post={post} />)
          ) : (
            <Layout.Block>Loading...</Layout.Block>
          )}
        </Layout.Content>
        <Layout.Footer>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by <img src="/vercel.svg" alt="Vercel Logo" />
          </a>
        </Layout.Footer>
      </Layout>
    </div>
  );
}

type User = { name: string };
type Post = { title: string; text: string; _id: string; user: User };

interface PostProps {
  post: Post;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const router = useRouter();

  return (
    <Layout.Block
      css={css`
        margin-bottom: 1rem;
        border: 1px solid #eee;
        border-radius: 5px;
        padding: 12px 18px;
        box-shadow: 1px 1px 10px -5px rgba(0, 0, 0, 0.1);
      `}
      onClick={() => router.push(`/post/${post._id}`)}
    >
      <div
        css={css`
          display: flex;
          justify-content: space-between;
        `}
      >
        <h3>{post.title}</h3>
        <span>{post.user.username}</span>
      </div>
    </Layout.Block>
  );
};
