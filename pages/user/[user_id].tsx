import { useRouter } from 'next/router';
import Link from 'next/link';
import { css } from '@emotion/core';
import { useTheme } from '@emotion/react';
import { Tabs } from 'antd';
import useSWR from 'swr';

import Layout from '../../components/Layout/Layout';

const { TabPane } = Tabs;

interface PostPreviewProps {
  post: Record<string, string>;
}

const PostPreview: React.FC<PostPreviewProps> = ({ post }) => {
  const router = useRouter();

  return (
    <div onClick={() => router.push(`/post/${post._id}`)}>
      <h3>{post.title}</h3>
      <p>{post.text.slice(0, 25)}...</p>
    </div>
  );
};

const UserView: React.FC = () => {
  const router = useRouter();
  const { user_id } = router.query;
  const { data, error } = useSWR(`user/${user_id}`);

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
            <Layout.Block>
              <h2>{data.username}</h2>
            </Layout.Block>
            <Layout.Block>
              <Tabs defaultActiveKey="1">
                <TabPane tab="Posts" key="1">
                  {data.posts.map((post) => (
                    <PostPreview post={post} key={post._id} />
                  ))}
                </TabPane>
                <TabPane tab="Comments" key="2">
                  {data.comments.map((comment) => (
                    <div key={comment._id}>{comment.text}</div>
                  ))}
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
