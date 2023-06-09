import { MutableState, Tools } from "final-form";

import update from "../src/update";

describe("update", () => {
  const getOp = (index: number, value: any) => {
    const changeValue = jest.fn();

    update(
      ["foo", index, value],
      {} as unknown as MutableState,
      { changeValue } as unknown as Tools,
    );
    return changeValue.mock.calls[0][2];
  };

  it("should call changeValue once", () => {
    const changeValue = jest.fn();

    const state = {};

    const result = update(
      ["foo", 0, "bar"],
      state as unknown as MutableState,
      { changeValue } as unknown as Tools,
    );

    expect(result).toBeUndefined();
    expect(changeValue).toHaveBeenCalled();
    expect(changeValue).toHaveBeenCalledTimes(1);
    expect(changeValue.mock.calls[0][0]).toBe(state);
    expect(changeValue.mock.calls[0][1]).toBe("foo");
    expect(typeof changeValue.mock.calls[0][2]).toBe("function");
  });

  it("should treat undefined like an empty array", () => {
    const op = getOp(0, "bar");
    const result = op(undefined);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0]).toBe("bar");
  });

  it("should update value of the specified index", () => {
    const op = getOp(1, "d");
    const array = ["a", "b", "c"];
    const result = op(array);

    expect(result).not.toBe(array); // copied
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(["a", "d", "c"]);
  });
});
