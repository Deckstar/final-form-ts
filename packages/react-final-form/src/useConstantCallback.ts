import * as React from "react";

/**
 * Creates a callback, even with closures, that will be instance === for the
 * lifetime of the component, always calling the most recent version of the
 * function and its closures.
 */
function useConstantCallback<F extends (...args: any[]) => any>(callback: F) {
  const ref = React.useRef(callback);

  React.useEffect(() => {
    ref.current = callback;
  });

  return React.useCallback(
    (...args: Parameters<F>) => ref.current.apply(null, args),
    [],
  ) as F;
}

export default useConstantCallback;
