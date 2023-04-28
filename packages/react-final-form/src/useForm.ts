import * as React from "react";
import type { FormApi, FormValuesShape } from "final-form";
import ReactFinalFormContext from "./context";

function useForm<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
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
