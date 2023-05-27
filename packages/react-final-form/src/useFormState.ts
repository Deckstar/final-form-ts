import type {
  FormApi,
  FormState,
  FormSubscription,
  FormValuesShape,
} from "final-form";
import * as React from "react";

import { addLazyFormState } from "./getters";
import { all, FullFormSubscription } from "./ReactFinalForm";
import type { KeyOfTypeTest, UseFormStateParams } from "./types";
import useForm from "./useForm";

export type FormStateHookResult<
  FormValues extends FormValuesShape,
  Subscription extends FormSubscription = FullFormSubscription,
> = FormState<FormValues> &
  Required<
    Pick<
      FormState<FormValues>,
      keyof FormState<FormValues> & KeyOfTypeTest<Subscription, true>
    >
  >;

/**
 * The `useFormState()` hook takes one optional
 * parameter, which matches the exact shape of
 * `FormSpyProps` (except without the render props). It
 * returns a `FormState`.
 *
 *`useFormState()` is used internally inside `<FormSpy/>`.
 */
function useFormState<
  FormValues extends FormValuesShape = FormValuesShape,
  Subscription extends FormSubscription = FullFormSubscription,
>({
  onChange,
  subscription = all as Subscription,
}: UseFormStateParams<FormValues, Subscription> = {}): FormStateHookResult<
  FormValues,
  Subscription
> {
  const form: FormApi<FormValues> = useForm<FormValues>("useFormState");
  const firstRender = React.useRef(true);

  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  // synchronously register and unregister to query field state for our subscription on first render
  const [state, setState] = React.useState<FormState<FormValues>>(
    (): FormState<FormValues> => {
      let initialState: FormState<FormValues> = {};

      const unsubscribe = form.subscribe((formState) => {
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

  const lazyState = {} as FormStateHookResult<FormValues, Subscription>;

  addLazyFormState(lazyState, state);

  return lazyState;
}

export default useFormState;
