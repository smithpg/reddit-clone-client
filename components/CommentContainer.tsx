import React from 'react';
import { css } from '@emotion/core';
import { Form, Input, Button, Typography } from 'antd';

import { User, Post, Comment } from '../types/entities';
import DateTime from './DateTime';
import VoteButtons from './VoteButtons';
import UserLink from './UserLink';

interface CommentContainerProps {
  ownedByUser: boolean;
  userVote: number;
  triggerReply?: (comment_id: string) => void;
  onEditFinish: (comment_id: string, newText: string) => Promise<void>;
  onClickDelete: (comment_id: string) => Promise<void>;
  onClickUpVote: (comment_id: string) => void;
  onClickDownVote: (comment_id: string) => void;
  comment: any;
}
const CommentContainer: React.FC<CommentContainerProps> = ({
  ownedByUser = false,
  userVote = 0,
  comment,
  triggerReply,
  onEditFinish,
  onClickDelete,
  onClickDownVote,
  onClickUpVote,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);

  return (
    <div
      css={css`
        padding: 4px 2px;
        display: grid;
        grid-template-columns: 30px auto;
        grid-template-rows: auto auto 50px;
      `}
    >
      <div
        css={css`
          grid-column: 1 /2;
          grid-row: 1;
        `}
      >
        <VoteButtons
          onClickUpVote={() => onClickUpVote(comment._id)}
          onClickDownVote={() => onClickDownVote(comment._id)}
          value={comment.points}
          userVote={userVote}
        />
      </div>
      <div
        css={css`
          display: flex;
          align-items: center;
          grid-column: 2 / 3;
          grid-row: 1 / 2;
        `}
      >
        <div
          css={css`
            flex-grow: 1;

            @media (max-width: 450px) {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
            }
          `}
        >
          <UserLink user={comment.user as User} />
          <DateTime
            ISOString={comment.createdAt}
            css={css`
              margin-left: 6px;
              color: rgba(0, 0, 0, 0.5);

              @media (max-width: 450px) {
                margin: 0px;
              } ;
            `}
          />
        </div>
      </div>
      <div
        css={css`
          grid-column: 2 / 3;
          grid-row: 2/ 3;
        `}
      >
        {isEditing ? (
          <Form
            initialValues={{ text: comment.text }}
            onFinish={async (values) => {
              await onEditFinish(comment._id, values.text);
              setIsEditing(false);
            }}
          >
            <Form.Item name="text">
              <Input.TextArea />
            </Form.Item>
            <Button htmlType="submit">Update</Button>
          </Form>
        ) : (
          comment.text
        )}
      </div>
      <div
        css={css`
          margin: 6px 0px;
          grid-column: 2/ 3;
          grid-row: 3;
          display: flex;
        `}
      >
        {triggerReply && (
          <Button onClick={() => triggerReply(comment._id)}>Reply</Button>
        )}
        {ownedByUser ? (
          <>
            <Button
              onClick={() => {
                setIsEditing(true);
              }}
            >
              Edit
            </Button>
            <Button
              onClick={() => {
                onClickDelete(comment._id);
              }}
            >
              Delete
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default CommentContainer;
