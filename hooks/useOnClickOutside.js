import React, { useEffect, useRef } from 'react';

export default function useOnClickOutside(cb) {
  const ref = useRef([]);

  const register = (element) => {
    ref.current = element;
  };

  useEffect(() => {
    // Bind the event listener
    document.addEventListener('mousedown', onClick);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  return register;

  /* Helper functions */

  function clickWasInside(event) {
    console.log(event.target);
    console.log(ref.current);

    console.log(ref.current.contains(event.target));
    console.log(ref.current && ref.current.contains(event.target));

    return ref.current && ref.current.contains(event.target);
  }
  function onClick(event) {
    if (!clickWasInside(event)) {
      console.log('closing');
      cb();
    }
  }
}
