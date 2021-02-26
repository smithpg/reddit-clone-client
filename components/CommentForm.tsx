import React from 'react';
import { css } from '@emotion/core';
import { Form, Input, Button } from 'antd';

interface CommentFormProps {
  parent_id?: string;
  showCancelButton?: boolean;
  submitComment: (text: string, parent_id?: string) => Promise<void>;
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
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const onFinish = (values) => {
    setIsSubmitting(true);
    submitComment(values.text, parent_id).then(() => {
      setIsSubmitting(false);
      form.setFieldsValue({ text: '' });
    });
  };

  return (
    <Form
      form={form}
      onFinish={onFinish}
      {...props}
      css={css`
        margin-left: ${indent}rem;
      `}
    >
      <Form.Item name="text">
        <Input.TextArea />
      </Form.Item>
      <Button loading={isSubmitting} htmlType="submit">
        Submit
      </Button>
      {showCancelButton && (
        <Button onClick={() => cancelComment(parent_id)}>Cancel</Button>
      )}
    </Form>
  );
};

export default CommentForm;
