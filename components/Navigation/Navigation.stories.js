import React from 'react';
import Navigation from './Navigation.tsx';

export const Primary = () => {
  const actions = [{ label: 'Test', onClick: () => alert('clicked test') }];

  return <Navigation actions={actions} />;
};

export default {
  component: Primary,
  title: 'Navigation',
};
