import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Form, Input, Button } from 'antd';
import useSWR, { mutate } from 'swr';

import { Post } from '../types/entities';
import { request } from '../utils';
import { useGlobal } from '../store';
import Layout from '../components/Layout';

const validateMessages = {
  required: '${label} is required!',
};

const NewPostView = () => {
  const { user, token } = useGlobal();
  const router = useRouter();

  const onFinish = async (values: any) => {
    console.log(values);

    const newPost = await request<Post>('post', { body: values, token: token });

    mutate('post');

    router.push(`/post/${newPost._id}`);
  };

  React.useEffect(() => {
    if (user === null) {
      router.push('/auth?redirect=new');
    }
  }, []);

  return (
    <>
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
    </>
  );
};

export default NewPostView;
