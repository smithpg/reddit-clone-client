import React from 'react';
import 'antd/dist/antd.css';
import { globalStyles } from '../styles';

const globalStyleDecorator = (Story) => (
  <>
    {globalStyles}
    <Story />
  </>
);

export const decorators = [globalStyleDecorator];
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};
