import React from 'react';

export default function useScrollPosition(): number {
  const [scroll, setScroll] = React.useState(0);

  React.useEffect(() => {
    const updateScroll = () => {
      setScroll(window.scrollY);
    };

    updateScroll();

    document.addEventListener('scroll', updateScroll);

    return () => {
      document.removeEventListener('scroll', updateScroll);
    };
  }, []);

  return scroll;
}

/* Helper functions */
