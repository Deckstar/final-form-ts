import formSubscriptionItems from "./formSubscriptionItems";
import subscriptionFilter from "./subscriptionFilter";
import type { FormState, FormSubscription, FormValuesShape } from "./types";

const shallowEqualKeys = ["touched", "visited"];

/**
 * Filters items in a `FormState` based on a
 * `FormSubscription`.
 */
export default function filterFormState<
  FormValues extends FormValuesShape = FormValuesShape,
  Subscription extends FormSubscription = {},
>(
  state: FormState<FormValues>,
  previousState: FormState<FormValues> | null | undefined,
  subscription: Subscription,
  force?: boolean,
): FormState<FormValues> | null | undefined {
  const result = {} as FormState<FormValues>;

  const different =
    subscriptionFilter(
      result,
      state,
      previousState,
      subscription,
      formSubscriptionItems,
      shallowEqualKeys,
    ) || !previousState;

  const stateResult = different || force ? result : undefined;
  return stateResult;
}
