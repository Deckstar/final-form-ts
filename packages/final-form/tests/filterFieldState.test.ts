import filterFieldState from "../src/filterFieldState";
import createForm from "../src/FinalForm";
import { FieldState } from "../src/types";

describe("filterFieldState", () => {
  const name = "foo";
  const state = {
    active: true,
    data: { someValue: 42 },
    dirty: false,
    error: "dog",
    initial: "initialValue",
    invalid: false,
    name,
    pristine: true,
    touched: true,
    valid: true,
    value: "cat",
    visited: true,
  } as unknown as FieldState;

  const testValue = (
    key: keyof FieldState,
    fieldState: FieldState,
    newValue: any,
  ) => {
    it(`should not notify when ${key} doesn't change`, () => {
      const result = filterFieldState(fieldState, fieldState, { [key]: true });
      expect(result).toBeUndefined();
    });

    it(`should not notify when ${key} changes`, () => {
      const result = filterFieldState(
        { ...fieldState, [key]: newValue },
        fieldState,
        { [key]: true },
      );
      expect(result).toEqual({
        [key]: newValue,
        name,
      });
    });

    it(`should notify when ${key} doesn't change, but is forced`, () => {
      const result = filterFieldState(
        fieldState,
        fieldState,
        { [key]: true },
        true,
      );
      expect(result).toEqual({
        [key]: fieldState[key],
        name,
      });
    });
  };

  describe("filterFieldState.active", () => {
    testValue("active", state, !state.active);
  });

  describe("filterFieldState.data", () => {
    testValue("data", state, { someValue: 43 });
  });

  describe("filterFieldState.dirty", () => {
    testValue("dirty", state, !state.dirty);
  });

  describe("filterFieldState.error", () => {
    testValue("error", state, "rabbit");
  });

  describe("filterFieldState.initial", () => {
    testValue("initial", state, "foobar");
  });

  describe("filterFieldState.invalid", () => {
    testValue("invalid", state, !state.invalid);
  });

  describe("filterFieldState.pristine", () => {
    testValue("pristine", state, !state.pristine);
  });

  describe("filterFieldState.touched", () => {
    testValue("touched", state, !state.touched);
  });

  describe("filterFieldState.valid", () => {
    testValue("valid", state, !state.valid);
  });

  describe("filterFieldState.value", () => {
    testValue("value", state, "whatever");
  });

  describe("filterFieldState.visited", () => {
    testValue("visited", state, !state.visited);
  });
});

describe("restart", () => {
  it('both state and value are cleared after a "restart" call', async () => {
    const fieldName = "fooField";

    const form = createForm({
      onSubmit: () => {},
    });
    // @ts-ignore
    form.registerField(fieldName, () => {});

    function isTouched() {
      return form.getState().touched![fieldName];
    }

    function value() {
      return form.getState().values![fieldName];
    }

    expect(isTouched()).not.toBeTruthy();
    form.focus(fieldName);
    form.blur(fieldName);
    expect(isTouched()).toBeTruthy();

    expect(value()).toBeUndefined();
    form.change(fieldName, 1);
    expect(value()).toEqual(1);

    form.restart();

    expect(isTouched()).not.toBeTruthy();
    expect(value()).toBeUndefined();
  });
});
