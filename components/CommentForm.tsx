import React from 'react';
import { css } from '@emotion/core';
import { Form, Input, Button } from 'antd';

interface CommentFormProps {
  parent_id?: string;
  showCancelButton?: boolean;
  submitComment: (text: string, parent_id?: string) => void;
  cancelComment: (parent_id?: string) => void;
  indent?: number;
}
const CommentForm: React.FC<CommentFormProps> = ({
  parent_id,
  showCancelButton = true,
  submitComment,
  cancelComment,
  indent = 0,
  ...props
}) => {
  return (
    <Form
      onFinish={(values) => submitComment(values.text, parent_id)}
      {...props}
      css={css`
        margin-left: ${indent}rem;
      `}
    >
      <Form.Item name="text">
        <Input.TextArea />
      </Form.Item>
      <Button htmlType="submit">Submit</Button>
      {showCancelButton && (
        <Button onClick={() => cancelComment(parent_id)}>Cancel</Button>
      )}
    </Form>
  );
};

export default CommentForm;
