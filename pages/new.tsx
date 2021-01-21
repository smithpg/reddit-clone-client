import { useRouter } from 'next/router';
import Link from 'next/link';
import { Form, Input, Button } from 'antd';
import useSWR, { mutate } from 'swr';

import { request } from '../utils';
import { useAuth } from '../store';
import Layout from '../components/Layout/Layout';

const validateMessages = {
  required: '${label} is required!',
};

const NewPostView = () => {
  const { user, token } = useAuth();
  const router = useRouter();

  const onFinish = async (values: any) => {
    console.log(values);

    const newPost = await request('post', { body: values, token: token });

    mutate('post');

    router.push(`/post/${newPost._id}`);
  };

  React.useEffect(() => {
    if (user === null) {
      router.push('/auth?redirect=new');
    }
  }, []);

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
        <Layout.Block>
          <h1> Create a Post</h1>
          <p>Fill out the fields below and press submit to create a new post</p>
        </Layout.Block>
        <Layout.Block>
          <Form
            layout="vertical"
            onFinish={onFinish}
            validateMessages={validateMessages}
          >
            <Form.Item name="title" label="Title">
              <Input />
            </Form.Item>
            <Form.Item name="text" label="Post Text">
              <Input.TextArea />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Layout.Block>
      </Layout.Content>
    </Layout>
  );
};

export default NewPostView;