import filterFormState from "../src/filterFormState";
import { FormState } from "../src/types";

describe("filterFormState", () => {
  const state = {
    active: "foo",
    dirty: false,
    error: "some error",
    invalid: false,
    initialValues: { dog: "cat" },
    pristine: true,
    submitting: false,
    submitFailed: false,
    submitSucceeded: false,
    submitError: "some submit error",
    touched: { foo: true, bar: false },
    valid: true,
    validating: false,
    values: { foo: "bar" },
    visited: { foo: true, bar: false },
  };

  const testValue = (
    key: keyof FormState,
    formState: FormState,
    newValue: any,
  ) => {
    it(`should not notify when ${key} doesn't change`, () => {
      const result = filterFormState(formState, formState, { [key]: true });
      expect(result).toBeUndefined();
    });

    it(`should not notify when ${key} changes`, () => {
      const result = filterFormState(
        { ...formState, [key]: newValue },
        formState,
        {
          [key]: true,
        },
      );
      expect(result).toEqual({
        [key]: newValue,
      });
    });

    it(`should notify when ${key} doesn't change, but is forced`, () => {
      const result = filterFormState(
        formState,
        formState,
        { [key]: true },
        true,
      );
      expect(result).toEqual({
        [key]: formState[key],
      });
    });
  };

  describe("filterFormState.active", () => {
    testValue("active", state, !state.active);
  });

  describe("filterFormState.dirty", () => {
    testValue("dirty", state, !state.dirty);
  });

  describe("filterFormState.error", () => {
    testValue("error", state, "rabbit");
  });

  describe("filterFormState.initialValues", () => {
    testValue("initialValues", state, { dog: "fido" });
  });

  describe("filterFormState.invalid", () => {
    testValue("invalid", state, !state.invalid);
  });

  describe("filterFormState.pristine", () => {
    testValue("pristine", state, !state.pristine);
  });

  describe("filterFormState.submitting", () => {
    testValue("submitting", state, !state.submitting);
  });

  describe("filterFormState.submitFailed", () => {
    testValue("submitFailed", state, !state.submitFailed);
  });

  describe("filterFormState.submitSucceeded", () => {
    testValue("submitSucceeded", state, !state.submitSucceeded);
  });

  describe("filterFormState.submitError", () => {
    testValue("submitError", state, !state.submitError);
  });

  describe("filterFormState.touched", () => {
    testValue("touched", state, { foo: true, bar: true });
  });

  describe("filterFormState.valid", () => {
    testValue("valid", state, !state.valid);
  });

  describe("filterFormState.validating", () => {
    testValue("validating", state, !state.validating);
  });

  describe("filterFormState.values", () => {
    testValue("values", state, { foo: "baz" });
  });

  describe("filterFormState.visited", () => {
    testValue("visited", state, { foo: true, bar: true });
  });
});
