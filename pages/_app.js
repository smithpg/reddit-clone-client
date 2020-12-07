import NextApp from 'next/app';
import 'antd/dist/antd.css';
import { SWRConfig } from 'swr';
import { CacheProvider } from '@emotion/core';

// Use only { cache } from 'emotion'. Don't use { css }.
import { cache } from 'emotion';

import { globalStyles } from '../styles';

export default class App extends NextApp {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <SWRConfig // Provides a global config for useSWR calls
        value={{
          fetcher: (resource, init) =>
            fetch(resource, init).then((res) => res.json()),
        }}
      >
        <CacheProvider value={cache}>
          {globalStyles}
          <Component {...pageProps} />
        </CacheProvider>
      </SWRConfig>
    );
  }
}
