import { AppProps } from 'next/app';
import 'antd/dist/antd.css';
import { SWRConfig } from 'swr';
import { CacheProvider } from '@emotion/core';
import { ThemeProvider } from '@emotion/react';
import { cache } from 'emotion';
import { globalStyles, theme } from '../styles';

import Navigation from '../components/Navigation/Navigation';

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <SWRConfig // Provides a global config for useSWR calls
      value={{
        fetcher: (resource, init) =>
          fetch(resource, init).then((res) => res.json()),
      }}
    >
      <ThemeProvider theme={theme}>
        <CacheProvider value={cache}>
          {globalStyles}
          <Navigation
            logo={<h1>Logo</h1>}
            actions={[
              { label: 'Test', onClick: () => alert('clicked') },
              { label: 'About', href: '/about' },
            ]}
          />
          <Component {...pageProps} />
        </CacheProvider>
      </ThemeProvider>
    </SWRConfig>
  );
};

export default App;
