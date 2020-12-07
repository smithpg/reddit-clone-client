import { useEffect } from "react";

const useKeyboardEvent = (key, condition, callback) => {
  useEffect(() => {
    if (condition) {
      const handler = function (event) {
        console.log(event);
        if (event.key === key) {
          callback();
        }
      };

      window.addEventListener("keydown", handler);

      return () => {
        window.removeEventListener("keydown", handler);
      };
    }
  }, [condition, callback, key]);
};

export default useKeyboardEvent;
