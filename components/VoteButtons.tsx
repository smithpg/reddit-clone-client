import React from 'react';
import { css } from '@emotion/core';
import { UpOutlined, DownOutlined } from '@ant-design/icons';

interface VoteButtonsProps {
  onClickUpVote: () => void;
  onClickDownVote: () => void;
  userVote: number;
  value: number;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({
  onClickUpVote,
  onClickDownVote,
  userVote,
  value,
}) => {
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 30px;
      `}
    >
      <UpOutlined
        onClick={onClickUpVote}
        css={
          userVote === 1
            ? css`
                color: red;
                text-shadow: 0px 0px red;
                transform: scale(1.1);
              `
            : null
        }
      />
      <span>{value}</span>
      <DownOutlined
        onClick={onClickDownVote}
        css={
          userVote === -1
            ? css`
                color: #1cd0ec;
              `
            : null
        }
      />
    </div>
  );
};

export default VoteButtons;
