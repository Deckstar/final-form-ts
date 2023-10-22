import { MutableState, Tools } from "final-form";

import concat from "../src/concat";

describe("concat", () => {
  const getOp = <V = any>(value: V[]) => {
    const changeValue = jest.fn();

    concat(
      ["foo", value],
      {} as MutableState,
      { changeValue } as unknown as Tools,
    );
    return changeValue.mock.calls[0][2];
  };

  it("should call changeValue once", () => {
    const changeValue = jest.fn();
    const state = {};
    const result = concat(
      ["foo", ["bar", "baz"]],
      state as MutableState,
      { changeValue } as unknown as Tools,
    );

    expect(result).toBeUndefined();
    expect(changeValue).toHaveBeenCalled();
    expect(changeValue).toHaveBeenCalledTimes(1);
    expect(changeValue.mock.calls[0][0]).toBe(state);
    expect(changeValue.mock.calls[0][1]).toBe("foo");
    expect(typeof changeValue.mock.calls[0][2]).toBe("function");
  });

  it("should turn undefined into an array with two values", () => {
    const op = getOp(["bar", "baz"]);
    const result = op(undefined);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(["bar", "baz"]);
  });

  it("should concat the array at the end of the original array", () => {
    const op = getOp(["d", "e"]);
    const result = op(["a", "b", "c"]);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(["a", "b", "c", "d", "e"]);
  });
});
