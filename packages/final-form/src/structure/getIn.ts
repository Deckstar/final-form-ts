import { FormValuesShape } from "../types";
import toPath from "./toPath";

export interface GetIn<O extends FormValuesShape = FormValuesShape> {
  <Key extends keyof O>(state: O | null | undefined, complexKey: Key): O[Key];
  <Key extends string>(state: O | null | undefined, complexKey: Key): any;
}

function getIn<O extends FormValuesShape, Key extends keyof O>(
  state: O | null | undefined,
  complexKey: Key,
): O[Key];
function getIn<O extends FormValuesShape = FormValuesShape>(
  state: O | null | undefined,
  complexKey: string,
): any;
function getIn<O extends FormValuesShape, Key extends string | keyof O>(
  state: O | null | undefined,
  complexKey: Key,
) {
  // Intentionally using iteration rather than recursion
  const path = toPath(complexKey as string);

  let current: any = state;

  for (let i = 0; i < path.length; i++) {
    const key = path[i];

    if (
      current === undefined ||
      current === null ||
      typeof current !== "object" ||
      (Array.isArray(current) &&
        // @ts-ignore
        isNaN(key))
    ) {
      return undefined;
    }

    current = current[key];
  }
  return current;
}

export default getIn;
