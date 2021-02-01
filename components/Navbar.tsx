import React from 'react';
import { css } from '@emotion/core';
import { Button, Typography } from 'antd';
import { useRouter } from 'next/router';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';

import Layout from './Layout';
import { useWindowSize, useOnClickOutside } from '../hooks';
import { useGlobal } from '../store';
import LinkButton from './LinkButton';

const Sidebar: React.FC = (props) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const register = useOnClickOutside(() => setIsOpen(false));

  const sidebarCSS = css`
    position: fixed;
    top: 0px;
    bottom: 0px;
    right: -50vw;
    width: 50vw;
    z-index: 999;

    background: white;
    box-shadow: -5px 0px 10px -5px rgba(0, 0, 0, 0.5);
    transform: ${isOpen ? 'translateX(-50vw)' : 'translateX(0vw)'};
    transition: 200ms all;

    .close-btn {
      padding: 12px 18px;
      display: flex;
      justify-content: flex-end;
      background: #333;
      color: white;
    }
  `;

  return (
    <>
      <MenuOutlined
        onClick={() => setIsOpen(true)}
        css={css`
          box-shadow: 0 0 10px -5px rgba(0, 0, 0, 0.85);
          border-radius: 50%;
          padding: 8px;
        `}
      />
      <div css={sidebarCSS} ref={register}>
        <div className="close-btn" onClick={() => setIsOpen(false)}>
          <CloseOutlined />
        </div>
        {props.children}
      </div>
    </>
  );
};

const Navbar: React.FC = (props) => {
  const router = useRouter();
  const { user, logout } = useGlobal();
  const { width } = useWindowSize();

  const showHorizontalNav = width > 500;
  const logo = <h1 onClick={() => router.push('/')}>Legenda</h1>;

  return (
    <Layout.Navbar logo={logo}>
      {showHorizontalNav ? (
        <ul
          css={css`
            display: flex;
            align-items: center;

            li {
              margin-left: 12px;
              cursor: pointer;
              &:hover {
                text-decoration: underline;
              }
            }
          `}
        >
          <li onClick={() => router.push('/new')}>
            <Button>+ New Post</Button>
          </li>
          <li
            css={css`
              opacity: 0.3;
            `}
          >
            |
          </li>
          {user ? (
            <>
              <li
                css={css`
                  font-style: italic;
                `}
                onClick={() => router.push(`/user/${user._id}`)}
              >
                {user.username}
              </li>
              <li onClick={logout}>Logout</li>
            </>
          ) : (
            <li onClick={() => router.push(`/auth`)}>Login</li>
          )}
        </ul>
      ) : (
        <Sidebar>
          <ul
            css={css`
              li {
                padding: 12px 18px;

                border-top: 1px solid #aaa;
                &::nth-of-type(1) {
                  border-top: 0px solid transparent;
                }
              }
            `}
          >
            <li onClick={() => router.push('/new')}>+ New Post</li>
            {user ? (
              <>
                <li onClick={() => router.push(`/user/${user._id}`)}>
                  My Profile
                </li>
                <li onClick={logout}>Logout</li>
              </>
            ) : (
              <li onClick={() => router.push(`/auth`)}>Login</li>
            )}
          </ul>
        </Sidebar>
      )}
    </Layout.Navbar>
  );
};

export default Navbar;
