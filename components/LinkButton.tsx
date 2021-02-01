import React from 'react';
import { useRouter } from 'next/router';
import { Button } from 'antd';

export default function LinkButton({ children, href, ...props }) {
  const router = useRouter();
  const navigate = () => {
    router.push(href);
  };

  return (
    <Button {...props} onClick={navigate}>
      {children}
    </Button>
  );
}
