import { keyframes, css, Global } from '@emotion/core';

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
        min-height: 100%;
        font-family: 'Inter', Helvetica, Arial, sans-serif;
      }
    `}
  />
);
