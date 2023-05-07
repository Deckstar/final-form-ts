import { ARRAY_ERROR } from "./constants";
import getIn from "./structure/getIn";
import type { InternalFieldState, InternalFormState } from "./types";
import type { FieldState, FormValuesShape } from "./types";

/**
 * Converts internal field state to published field state.
 */
function publishFieldState<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
  FieldValue = any,
>(
  formState: InternalFormState<FormValues, InitialFormValues>,
  field: InternalFieldState<FieldValue, FormValues>,
): FieldState<FieldValue, FormValues> {
  const {
    errors,
    initialValues,
    lastSubmittedValues,
    submitErrors,
    submitFailed,
    submitSucceeded,
    submitting,
    values,
  } = formState;

  const {
    active,
    blur,
    change,
    data,
    focus,
    modified,
    modifiedSinceLastSubmit,
    name,
    touched,
    validating,
    visited,
  } = field;

  const value = getIn(values, name);

  let error = getIn(errors, name);
  if (error && error[ARRAY_ERROR]) {
    error = error[ARRAY_ERROR];
  }

  const submitError = submitErrors && getIn(submitErrors, name);
  const initial = initialValues && getIn(initialValues, name);
  const pristine = field.isEqual(initial, value);
  const dirtySinceLastSubmit = !!(
    lastSubmittedValues &&
    !field.isEqual(getIn(lastSubmittedValues, name), value)
  );

  const valid = !error && !submitError;
  return {
    active,
    blur,
    change,
    data,
    dirty: !pristine,
    dirtySinceLastSubmit,
    error,
    focus,
    initial,
    invalid: !valid,
    length: Array.isArray(value) ? value.length : undefined,
    modified,
    modifiedSinceLastSubmit,
    name,
    pristine,
    submitError,
    submitFailed,
    submitSucceeded,
    submitting,
    touched,
    valid,
    value,
    visited,
    validating,
  };
}

export default publishFieldState;
