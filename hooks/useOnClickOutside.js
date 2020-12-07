import React, { useEffect, useRef } from 'react';

export default function useOnClickOutside(cb) {
    const ref = useRef([]);

    const register = (element) => {
        ref.current.push(element);
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

    function clickWasOutside(event) {
        // Return true if any of the registered elements
        // contain the target of passed event
        return ref.current.some((registeredElement) =>
            registeredElement.contains(event.target)
        );
    }
    function onClick(event) {
        if (clickWasOutside(event)) {
            cb();
        }
    }
}
