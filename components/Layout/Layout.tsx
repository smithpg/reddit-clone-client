import React from 'react';
import { css } from '@emotion/core';
import { useTheme } from '@emotion/react';

/* Component-specific imports */
import { useScrollPosition, useScreenWidth } from '../../hooks';

/* Component definition */

const navbarHeight = 84;

const layoutContainerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
  min-height: 100vh;
`;

interface ComplexComponent extends React.FC {
  [key: string]: any;
}

const Layout: ComplexComponent = (props) => {
  return (
    <div data-testid="Layout" className="Layout" css={layoutContainerStyle}>
      {props.children}
    </div>
  );
};

Layout.FullWidthBlock = ({ children, ...props }) => {
  return (
    <div
      {...props}
      css={css`
        width: 100vw;
        padding: 12px 18px;
      `}
    >
      {children}
    </div>
  );
};

Layout.Block = ({ children, ...props }) => {
  const theme: Record<string, any> = useTheme();

  return (
    <div
      {...props}
      css={css`
        max-width: ${theme.contentColumnWidth}px;
        padding: 12px 18px;
        margin: 0px auto;
      `}
    >
      {children}
    </div>
  );
};

Layout.Navbar = ({ children, logo, ...props }) => {
  const screenWidth = useScreenWidth();

  const scrollY = useScrollPosition();
  const documentHasScrolled = scrollY !== 0;

  const theme: Record<string, any> = useTheme();

  return (
    <nav
      {...props}
      css={css`
        background: ${theme.colors.brand};
        color: white;
        transition: all 200;
        ${documentHasScrolled
          ? `
        position: fixed;
        top: 0px;
        left: 0px;
        right: 0px;
        box-shadow: 0px 0px 10px -5px rgba(0,0,0,0.1);
        `
          : `position: static`};
      `}
    >
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: ${theme.contentColumnWidth}px;
          margin: 0px auto;
          height: ${navbarHeight}px;
          padding: 12px 18px;
        `}
      >
        {logo}
        <div>{children}</div>
      </div>
    </nav>
  );
};

Layout.Content = ({ children }) => {
  const scrollY = useScrollPosition();
  const documentHasScrolled = scrollY !== 0;

  return (
    <div
      css={css`
        flex-grow: 1;
        padding: 12px 0px;
        ${documentHasScrolled && `padding-top: ${12 + navbarHeight}px;`}

        h1 {
          margin-bottom: 1em;
        }
        p {
          margin-bottom: 0.5em;
        }
      `}
    >
      {children}
    </div>
  );
};

Layout.Footer = ({ children }) => {
  const theme: Record<string, any> = useTheme();

  return (
    <footer
      css={css`
        min-height: 100px;
        background-color: ${theme.colors.brand};
      `}
    >
      {children}
    </footer>
  );
};

export default Layout;
