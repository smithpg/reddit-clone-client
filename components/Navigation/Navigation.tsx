import React from 'react';
import { css } from '@emotion/core';

/* Component-specific imports */
import Link from 'next/link';

/* Component definition */
const styles = css`
  nav {
    padding: 12px 24px;
    max-width: 800px;
    margin: 0px auto;
    display: flex;
    align-items: center;
    div {
      flex-grow: 1;
      text-align: left;
    }
  }

  ul {
    display: flex;
    align-items: center;
  }

  li {
    margin-left: 12px;

    button {
      cursor: pointer;
      background: none;
      border: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

type Action = {
  label: string;
  onClick?: () => void;
  href?: string;
};

type Props = {
  logo: React.ReactNode;
  actions?: Action[];
};

const Navigation: React.FC<Props> = ({ logo, actions }) => {
  return (
    <header css={styles} data-testid="Navigation" className="Navigation">
      <nav>
        <div>{logo}</div>
        <ul>
          {actions.map(({ label, href, onClick }) => (
            <li key={label}>
              {href ? (
                <Link href={href}>{label}</Link>
              ) : (
                <button onClick={onClick}>{label}</button>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navigation;
