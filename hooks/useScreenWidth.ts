import React from 'react';

export default function useScreenWidth(): number {
  const [screenWidth, setScreenWidth] = React.useState(null);

  React.useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.screen.width);
    };

    updateScreenWidth();

    document.addEventListener('resize', updateScreenWidth);

    return () => {
      document.removeEventListener('resize', updateScreenWidth);
    };
  }, []);

  return screenWidth;
}
