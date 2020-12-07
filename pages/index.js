import { Layout } from 'antd';
import { css } from '@emotion/core';
import Head from 'next/head';

/* Page specific imports */
export default function Home() {
  return (
    <Layout>
      <Layout.Content
        css={css`
          max-width: 400;
          margin: 0px auto;
        `}
      >
        Hello World!
      </Layout.Content>
    </Layout>
  );
}
