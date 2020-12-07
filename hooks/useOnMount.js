import React from "react";

export default function useOnMount(cb) {
  React.useEffect(() => {
    cb();
  }, []);
}
