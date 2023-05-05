import type {
  FormApi,
  FormState,
  FormSubscription,
  FormValuesShape,
} from "final-form";
import * as React from "react";

import { addLazyFormState } from "./getters";
import { all } from "./ReactFinalForm";
import type { UseFormStateParams } from "./types";
import useForm from "./useForm";

export type FormStateHookResult<
  FormValues extends FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
  Subscription extends FormSubscription = Required<FormSubscription>,
> = FormState<FormValues, InitialFormValues> &
  Required<
    Pick<
      FormState<FormValues, InitialFormValues>,
      keyof FormState<FormValues, InitialFormValues> & keyof Subscription
    >
  >;

function useFormState<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
  Subscription extends FormSubscription = Required<FormSubscription>,
>({
  onChange,
  subscription = all as Required<Subscription>,
}: UseFormStateParams<
  FormValues,
  InitialFormValues,
  Subscription
> = {}): FormStateHookResult<FormValues, InitialFormValues, Subscription> {
  const form: FormApi<FormValues, InitialFormValues> = useForm<
    FormValues,
    InitialFormValues
  >("useFormState");
  const firstRender = React.useRef(true);

  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  // synchronously register and unregister to query field state for our subscription on first render
  const [state, setState] = React.useState<
    FormState<FormValues, InitialFormValues>
  >((): FormState<FormValues, InitialFormValues> => {
    let initialState: FormState<FormValues, InitialFormValues> = {};

    const unsubscribe = form.subscribe((formState) => {
      initialState = formState;
    }, subscription);

    unsubscribe();

    if (onChange) {
      onChange(initialState);
    }

    return initialState;
  });

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

  const lazyState = {};

  // @ts-ignore
  addLazyFormState(lazyState, state);

  return lazyState as FormStateHookResult<
    FormValues,
    InitialFormValues,
    Subscription
  >;
}

export default useFormState;
