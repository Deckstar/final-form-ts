import React from "react";

function useLatest<T>(value: T): { readonly current: T } {
  const ref = React.useRef(value);

  React.useEffect(() => {
    ref.current = value;
  });

  return ref;
}

export default useLatest;
