import type { FormApi, FormState, FormValuesShape } from "final-form";
import * as React from "react";

import { addLazyFormState } from "./getters";
import { all } from "./ReactFinalForm";
import type { UseFormStateParams } from "./types";
import useForm from "./useForm";

function useFormState<FormValues extends FormValuesShape = FormValuesShape>({
  onChange,
  subscription = all,
}: UseFormStateParams<FormValues> = {}): FormState<FormValues> {
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

  const lazyState = {};

  addLazyFormState(lazyState, state);

  return lazyState;
}

export default useFormState;
