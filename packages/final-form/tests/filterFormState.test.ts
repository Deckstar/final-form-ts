import filterFormState from "../src/filterFormState";
import { FormState } from "../src/types";

describe("filterFormState", () => {
  const state = {
    active: "foo" as string | undefined,
    dirty: false as boolean,
    dirtyFields: {},
    dirtyFieldsSinceLastSubmit: {},
    dirtySinceLastSubmit: false,
    error: "some error" as string,
    errors: undefined,
    hasSubmitErrors: false,
    hasValidationErrors: false,
    invalid: false as boolean,
    initialValues: { dog: "cat" } as { dog: string },
    modified: {},
    modifiedSinceLastSubmit: false,
    pristine: true as boolean,
    status: "Step 1" as "Step 1" | "Step 2",
    submitErrors: undefined,
    submitting: false as boolean,
    submitFailed: false as boolean,
    submitSucceeded: false as boolean,
    submitError: "some submit error" as string | undefined,
    touched: { foo: true as boolean, bar: false as boolean },
    valid: true as boolean,
    validating: false as boolean,
    values: { foo: "bar" as string },
    visited: { foo: true as boolean, bar: false as boolean },
  } as const satisfies FormState<
    { dog: string } | { cat: string } | { foo: string }
  >;

  const testValue = <Key extends keyof FormState, State extends FormState>(
    key: Key,
    formState: State,
    newValue: State[Key],
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
    testValue("active", state, undefined);
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

  describe("filterFormState.status", () => {
    testValue("status", state, "Step 2");
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
    testValue("submitError", state, undefined);
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
