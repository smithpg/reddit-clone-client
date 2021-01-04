import { css, Global } from '@emotion/core';

export const theme = {
  colors: {
    brand: '#7492cc',
    accent: '#ebbc3d',
  },
  contentColumnWidth: 800,
};

export const globalStyles = (
  <Global
    styles={css`
      * {
        box-sizing: border-box;
      }

      html,
      body {
        padding: 0;
        margin: 0;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      h1,
      h2,
      h3,
      h4,
      h5 {
        margin: 0px;
      }
    `}
  />
);
