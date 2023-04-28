const isPromise = <T extends any>(obj: T | Promise<T>): obj is Promise<T> =>
  !!obj &&
  (typeof obj === "object" || typeof obj === "function") &&
  // @ts-ignore
  typeof obj.then === "function";

export default isPromise;
