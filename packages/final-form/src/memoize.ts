import shallowEqual from "./shallowEqual";

const memoize = <F extends (...args: any[]) => any>(fn: F): F => {
  let lastArgs: Parameters<F>;
  let lastResult: ReturnType<F>;

  const memoizedFn: F = ((...args: Parameters<F>) => {
    if (
      !lastArgs ||
      args.length !== lastArgs.length ||
      args.some((arg, index) => !shallowEqual(lastArgs[index], arg))
    ) {
      lastArgs = args;

      lastResult = fn(...args);
    }

    return lastResult;
  }) as F;

  return memoizedFn;
};

export default memoize;
