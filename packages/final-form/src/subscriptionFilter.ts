import shallowEqual from "./shallowEqual";
import { FieldSubscription, FormSubscription } from "./types";

function subscriptionFilter<
  T extends { [key: string]: any },
  Subscription extends FieldSubscription | FormSubscription,
>(
  dest: T,
  src: T,
  previous: T | null | undefined,
  subscription: Subscription,
  keys: readonly (string & keyof Subscription)[],
  shallowEqualKeys: string[],
): boolean {
  let different = false;

  keys.forEach((key) => {
    if (subscription[key]) {
      dest[key] = src[key];

      if (
        !previous ||
        (~shallowEqualKeys.indexOf(key)
          ? !shallowEqual(src[key], previous[key])
          : src[key] !== previous[key])
      ) {
        different = true;
      }
    }
  });
  return different;
}

export default subscriptionFilter;
