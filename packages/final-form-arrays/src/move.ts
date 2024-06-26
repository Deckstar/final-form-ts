import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";
import { BoundMutator } from "final-form";

import copyField from "./copyField";
import { escapeRegexTokens } from "./utils";

/** Arguments for the `move` mutator. */
export type MoveArguments<Key extends string = string> = [
  name: Key,
  from: number,
  to: number,
];

/** Return type for the `move` mutator. */
export type MoveResult = void;

/** The bound `move` function. */
export type Move<FormValues extends FormValuesShape = FormValuesShape> =
  BoundMutator<MoveMutator<FormValues>, MoveArguments, MoveResult, FormValues> &
    (<Key extends string>(...args: MoveArguments<Key>) => MoveResult);

/** The unbound `move` function. */
export type MoveMutator<FormValues extends FormValuesShape = FormValuesShape> =
  Mutator<MoveArguments, MoveResult, FormValues> &
    (<Key extends string & keyof FormValues>(
      ...mutatorArgs: MutatorArguments<MoveArguments<Key>, FormValues>
    ) => MoveResult);

const move: MoveMutator = (
  ...mutatorArgs: MutatorArguments<MoveArguments<string>>
) => {
  const [[name, from, to], state, { changeValue }] = mutatorArgs;

  if (from === to) {
    return;
  }

  changeValue(state, name, (array: any[] | null | undefined): any[] => {
    const copy = [...(array || [])];
    const value = copy[from];

    copy.splice(from, 1);
    copy.splice(to, 0, value);

    return copy;
  });

  const newFields: typeof state.fields = {};

  const pattern = new RegExp(`^${escapeRegexTokens(name)}\\[(\\d+)\\](.*)`);

  type FromOrTo = typeof from | typeof to;

  let lowest: FromOrTo;
  let highest: FromOrTo;
  let increment: 1 | -1;

  if (from > to) {
    lowest = to;
    highest = from;
    increment = 1;
  } else {
    lowest = from;
    highest = to;
    increment = -1;
  }

  Object.keys(state.fields).forEach((key) => {
    const tokens = pattern.exec(key);
    if (tokens) {
      const fieldIndex = Number(tokens[1]);
      if (fieldIndex === from) {
        const newKey = `${name}[${to}]${tokens[2]}`;
        copyField(state.fields, key, newFields, newKey);
        return;
      }

      if (lowest <= fieldIndex && fieldIndex <= highest) {
        // Shift all indices
        const newKey = `${name}[${fieldIndex + increment}]${tokens[2]}`;
        copyField(state.fields, key, newFields, newKey);
        return;
      }
    }

    // Keep this field that does not match the name,
    // or has index smaller or larger than affected range
    newFields[key] = state.fields[key];
  });

  state.fields = newFields;
};

export default move;
