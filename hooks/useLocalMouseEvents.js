import React, { useState } from 'react';

function getEventPositionRelativeToElement(e) {
    const { clientY, clientX, target } = e;
    const { top, left, height, width } = target.getBoundingClientRect();

    return {
        localX: (clientX - (left + width / 2)) / width,
        localY: (clientY - (top + height / 2)) / height,
    };
}

export default function useLocalMouseEvents(config) {
    const [mouseState, setMouseState] = useState({
        localX: null,
        localY: null,
        isHovered: false,
    });

    function onMouseEnter(e) {
        setMouseState({
            isHovered: true,
            ...getEventPositionRelativeToElement(e),
        });
    }

    function onMouseMove(e) {
        setMouseState({
            isHovered: true,
            ...getEventPositionRelativeToElement(e),
        });
    }

    function onClick(e) {
        setMouseState({
            isHovered: true,
            ...getEventPositionRelativeToElement(e),
        });
    }

    function onMouseLeave(e) {
        console.log('mouseleave');
        setMouseState({ ...mouseState, isHovered: false });
    }

    const eventHandlers = {
        onMouseEnter,
        onMouseLeave,
        onMouseMove,
        onClick,
    };

    return [mouseState, eventHandlers];
}
