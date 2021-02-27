import { AppProps } from 'next/app';
import 'antd/dist/antd.css';
import { SWRConfig } from 'swr';
import { CacheProvider } from '@emotion/core';
import { ThemeProvider } from '@emotion/react';
import { cache } from 'emotion';

import { GlobalProvider } from '../store';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import { request } from '../utils';
import { globalStyles, theme } from '../styles/index';

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <SWRConfig // Provides a global config for useSWR calls
      value={{
        fetcher: request,
        // fetcher: (resource, init) => console.log(resource, init),
      }}
    >
      <GlobalProvider>
        <ThemeProvider theme={theme}>
          <CacheProvider value={cache}>
            {globalStyles}
            <Layout>
              <Navbar />
              <Layout.Content>
                <Component {...pageProps} />
              </Layout.Content>
            </Layout>
          </CacheProvider>
        </ThemeProvider>
      </GlobalProvider>
    </SWRConfig>
  );
};

export default App;
