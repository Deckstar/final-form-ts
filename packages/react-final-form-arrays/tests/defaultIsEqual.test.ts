import defaultIsEqual from "../src/defaultIsEqual";

describe("defaultIsEqual", () => {
  it("be true when both undefined", () => {
    expect(
      defaultIsEqual(
        // @ts-expect-error
        undefined,
        undefined,
      ),
    ).toBe(true);
  });

  it("be true when ===", () => {
    const array = [1, 2];
    expect(defaultIsEqual(array, array)).toBe(true);
  });

  it("be false when either is not an array", () => {
    expect(
      defaultIsEqual(
        // @ts-expect-error
        {},
        [1, 2, 3],
      ),
    ).toBe(false);
    expect(
      defaultIsEqual(
        [1, 2, 3],
        // @ts-expect-error
        {},
      ),
    ).toBe(false);
    expect(
      defaultIsEqual(
        // @ts-expect-error
        {},
        {},
      ),
    ).toBe(false);
  });

  it("be false when different lengths", () => {
    expect(defaultIsEqual(["a", "b", "c"], ["a", "b", "c", "d"])).toBe(false);
  });

  it("be false when identical, but deeper", () => {
    expect(
      defaultIsEqual(["a", { foo: "b" }, "c"], ["a", { foo: "b" }, "c"]),
    ).toBe(false);
  });

  it("be true when contents are the same", () => {
    expect(defaultIsEqual(["a", "b", "c"], ["a", "b", "c"])).toBe(true);
  });
});
