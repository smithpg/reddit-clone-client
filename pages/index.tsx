import Head from 'next/head';
import { css } from '@emotion/core';
import Layout from '../components/Layout/Layout';

export default function Home(): React.ReactNode {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Layout.Navbar logo={<h1>Puku Pals</h1>}>navbar</Layout.Navbar>
        <Layout.Content>
          <Layout.Block
            css={css`
              background-color: red;
            `}
          >
            <h1>
              Feeling as though you have no reason to go on?
              <em>You’re not alone.</em>
            </h1>
            <p>
              PukkuPals provides a community where users can feel invited not
              only to leave this world behind, but to have their final wishes
              accommodated. The platform is designed to allow for both Japanese
              and non-Japanese speakers to find these contractors, who are paid
              commissions based on securing the job.
            </p>
          </Layout.Block>
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
