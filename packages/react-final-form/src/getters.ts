import type { FormState, FieldState, FormValuesShape } from "final-form";
import { AnyObject } from "./types";

const addLazyState = <
  FormValues extends FormValuesShape,
  State extends FieldState | FormState<FormValues>,
>(
  dest: AnyObject,
  state: State,
  keys: (string & keyof State)[],
): void => {
  keys.forEach((key) => {
    Object.defineProperty(dest, key, {
      get: () => state[key],
      enumerable: true,
    });
  });
};

export const addLazyFormState = <FormValues extends FormValuesShape>(
  dest: AnyObject,
  state: FormState<FormValues>,
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
  state: FieldState,
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
