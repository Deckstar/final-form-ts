import formSubscriptionItems from "./formSubscriptionItems";
import subscriptionFilter from "./subscriptionFilter";
import type { FormState, FormSubscription, FormValuesShape } from "./types";

const shallowEqualKeys = ["touched", "visited"];

/**
 * Filters items in a FormState based on a FormSubscription
 */
export default function filterFormState<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
>(
  state: FormState<FormValues, InitialFormValues>,
  previousState: FormState<FormValues, InitialFormValues> | null | undefined,
  subscription: FormSubscription,
  force?: boolean,
): FormState<FormValues, InitialFormValues> | null | undefined {
  const result: FormState<FormValues, InitialFormValues> = {};

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
