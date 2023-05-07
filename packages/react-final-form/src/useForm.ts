import type { FormApi, FormValuesShape } from "final-form";
import * as React from "react";

import ReactFinalFormContext from "./context";

/**
 * The `useForm()` hook plucks the `FormApi` out of the
 * React context for you. It will throw an exception if
 * you try to use it outside of a `<Form/>` component.
 *
 * `useForm()` is used internally inside `useField()`,
 * `<Field/>`, and `<FormSpy/>`.
 *
 */
function useForm<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
>(componentName?: string): FormApi<FormValues, InitialFormValues> {
  const form: FormApi<FormValues, InitialFormValues> = React.useContext(
    ReactFinalFormContext,
  );

  if (!form) {
    throw new Error(
      `${componentName || "useForm"} must be used inside of a <Form> component`,
    );
  }

  return form;
}

export default useForm;
