import fieldSubscriptionItems from "./fieldSubscriptionItems";
import type { StateFilter } from "./FinalForm";
import subscriptionFilter from "./subscriptionFilter";
import type { FieldState, FieldSubscription } from "./types";

const shallowEqualKeys = ["data"];

/**
 * Filters items in a FieldState based on a FieldSubscription
 */
const filterFieldState: StateFilter<FieldState> = (
  state: FieldState,
  previousState: FieldState | null | undefined,
  subscription: FieldSubscription,
  force?: boolean,
): FieldState | null | undefined => {
  const result: FieldState = {
    blur: state.blur,
    change: state.change,
    focus: state.focus,
    name: state.name,
  };

  const different =
    subscriptionFilter(
      result,
      state,
      previousState,
      subscription,
      fieldSubscriptionItems,
      shallowEqualKeys,
    ) || !previousState;

  const stateResult = different || force ? result : undefined;
  return stateResult;
};

export default filterFieldState;
