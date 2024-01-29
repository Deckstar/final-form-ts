import type {
  FormApi,
  FormStateBasedOnSubscription,
  FormSubscription,
  FormValuesShape,
  FullFormSubscription,
} from "final-form";
import * as React from "react";

import { addLazyFormState } from "./getters";
import { all } from "./ReactFinalForm";
import type { UseFormStateParams } from "./types";
import useForm from "./useForm";

/**
 * The `useFormState()` hook takes one optional parameter, which matches the
 * exact shape of `FormSpyProps` (except without the render props). It returns a
 * `FormState`.
 *
 * `useFormState()` is used internally inside `<FormSpy/>`.
 */
function useFormState<
  FormValues extends FormValuesShape = FormValuesShape,
  Subscription extends FormSubscription = FullFormSubscription,
>({
  onChange,
  subscription = all as Subscription,
}: UseFormStateParams<
  FormValues,
  Subscription
> = {}): FormStateBasedOnSubscription<FormValues, Subscription> {
  const form: FormApi<FormValues> = useForm<FormValues>("useFormState");
  const firstRender = React.useRef(true);

  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  /** The `FormState` based on the passed in `subscription`. */
  type SubscribedState = FormStateBasedOnSubscription<FormValues, Subscription>;

  // synchronously register and unregister to query field state for our subscription on first render
  const [state, setState] = React.useState<SubscribedState>(
    (): SubscribedState => {
      let initialState = {} as SubscribedState;

      const unsubscribe = form.subscribe<Subscription>((formState) => {
        initialState = formState;
      }, subscription);

      unsubscribe();

      if (onChange) {
        onChange(initialState);
      }

      return initialState;
    },
  );

  React.useEffect(
    function initializeSubscription() {
      const unsubscribe = form.subscribe((newState) => {
        if (firstRender.current) {
          firstRender.current = false;
        } else {
          setState(newState);

          if (onChangeRef.current) {
            onChangeRef.current(newState);
          }
        }
      }, subscription);

      return unsubscribe;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const lazyState = {} as FormStateBasedOnSubscription<
    FormValues,
    Subscription
  >;

  addLazyFormState(lazyState, state);

  return lazyState;
}

export default useFormState;
