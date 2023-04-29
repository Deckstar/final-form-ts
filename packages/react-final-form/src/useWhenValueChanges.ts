import React from "react";

function useWhenValueChanges(
  value: any,
  callback: () => void,
  isEqual: (a: any, b: any) => boolean = (a, b) => a === b,
) {
  const previous = React.useRef(value);

  React.useEffect(() => {
    if (!isEqual(value, previous.current)) {
      callback();

      previous.current = value;
    }
  });
}

export default useWhenValueChanges;
