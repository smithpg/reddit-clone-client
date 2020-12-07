import React from 'react';

export default function useToggle(init) {
    const [state, setState] = React.useState(init);

    const toggle = () => setState((s) => !s);

    return [state, toggle];
}
