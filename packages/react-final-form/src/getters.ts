import type {
  AnyObject,
  FieldState,
  FormState,
  FormValuesShape,
} from "final-form";

const addLazyState = <
  State extends FieldState<FieldValue> | FormState<FormValues>,
  FormValues extends FormValuesShape = FormValuesShape,
  FieldValue = any,
>(
  dest: AnyObject,
  state: Partial<State>,
  keys: (string & keyof State)[],
): void => {
  keys.forEach((key) => {
    Object.defineProperty(dest, key, {
      get: () => state[key],
      enumerable: true,
    });
  });
};

export const addLazyFormState = <
  FormValues extends FormValuesShape = FormValuesShape,
>(
  dest: AnyObject,
  state: Partial<FormState<FormValues>>,
): void =>
  addLazyState(dest, state, [
    "active",
    "dirty",
    "dirtyFields",
    "dirtySinceLastSubmit",
    "dirtyFieldsSinceLastSubmit",
    "error",
    "errors",
    "hasSubmitErrors",
    "hasValidationErrors",
    "initialValues",
    "invalid",
    "modified",
    "modifiedSinceLastSubmit",
    "pristine",
    "submitError",
    "submitErrors",
    "submitFailed",
    "submitSucceeded",
    "submitting",
    "touched",
    "valid",
    "validating",
    "values",
    "visited",
  ]);

export const addLazyFieldMetaState = (
  dest: AnyObject,
  state: Partial<FieldState>,
): void =>
  addLazyState(dest, state, [
    "active",
    "data",
    "dirty",
    "dirtySinceLastSubmit",
    "error",
    "initial",
    "invalid",
    "length",
    "modified",
    "modifiedSinceLastSubmit",
    "pristine",
    "submitError",
    "submitFailed",
    "submitSucceeded",
    "submitting",
    "touched",
    "valid",
    "validating",
    "visited",
  ]);
