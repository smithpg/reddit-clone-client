import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { css } from '@emotion/core';
import { Form, Input, Button } from 'antd';

import { AuthContext } from '../store/index';
import request from '../utils/API';
import Layout from '../components/Layout/Layout';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const validateMessages = {
  required: '${label} is required!',
};

const [LOGIN, SIGNUP] = [0, 1];

const AuthView = () => {
  const router = useRouter();
  const authCtx = React.useContext(AuthContext);
  const [mode, setMode] = React.useState(LOGIN);

  const onFinish = async (values: any) => {
    const endpoint = mode === LOGIN ? 'auth/login' : 'auth/signup';
    const body = { ...values };
    delete body['confirm'];

    const res = await request(endpoint, { body });

    authCtx.login({ username: res.username, token: res.token });
    console.log(res);
    console.log(`Redirecting to ${router.query.redirect}`);

    router.push(router.query.redirect || '/');
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
        <Layout.Block>
          <h1> {mode === LOGIN ? 'Login' : 'Sign Up'}</h1>
          <p
            onClick={() => {
              setMode((m) => (m === LOGIN ? SIGNUP : LOGIN));
            }}
            css={css`
              text-decoration: underline;
            `}
          >
            {mode === LOGIN
              ? 'New to legenda? Click here to create an account'
              : 'Already have an account? Click here to login.'}
          </p>
        </Layout.Block>
        <Layout.Block>
          <Form
            layout="vertical"
            onFinish={onFinish}
            validateMessages={validateMessages}
          >
            <Form.Item name="username" label="Username" required>
              <Input />
            </Form.Item>
            {mode === SIGNUP && (
              <Form.Item
                name="email"
                label="Email"
                required
                rules={[
                  {
                    type: 'email',
                    message: 'The input is not valid E-mail!',
                  },
                ]}
              >
                <Input />
              </Form.Item>
            )}
            <Form.Item name="password" label="Password" required>
              <Input.Password />
            </Form.Item>
            {mode === SIGNUP && (
              <Form.Item
                name="confirm"
                label="Confirm Password"
                dependencies={['password']}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: 'Please confirm your password!',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        'The two passwords that you entered do not match!'
                      );
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            )}
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

export default AuthView;
