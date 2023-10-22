import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";
import { BoundMutator } from "final-form";

import copyField from "./copyField";
import { ArrayElement } from "./types";
import { escapeRegexTokens } from "./utils";

type InsertArguments<
  FormValues extends FormValuesShape = FormValuesShape,
  Key extends string = string,
> = [
  name: Key,
  index: number,
  value: FormValues[Key] extends any[] ? ArrayElement<FormValues[Key]> : any,
];

type InsertResult = void;

/** The bound `insert` function. */
export type Insert<FormValues extends FormValuesShape = FormValuesShape> =
  BoundMutator<
    InsertMutator<FormValues>,
    InsertArguments<FormValues>,
    InsertResult,
    FormValues
  > &
    (<Key extends string>(
      ...args: InsertArguments<FormValues, Key>
    ) => InsertResult);

/** The unbound `insert` function. */
export type InsertMutator<
  FormValues extends FormValuesShape = FormValuesShape,
> = Mutator<InsertArguments<FormValues>, InsertResult, FormValues> &
  (<Key extends string & keyof FormValues>(
    ...mutatorArgs: MutatorArguments<
      InsertArguments<FormValues, Key>,
      FormValues
    >
  ) => InsertResult);

const insert: InsertMutator = (
  ...mutatorArgs: MutatorArguments<InsertArguments>
) => {
  const [[name, index, value], state, { changeValue }] = mutatorArgs;

  changeValue(state, name, (array: any[] | null | undefined): any[] => {
    const copy = [...(array || [])];

    copy.splice(index, 0, value);

    return copy;
  });

  // now we have increment any higher indexes
  const pattern = new RegExp(`^${escapeRegexTokens(name)}\\[(\\d+)\\](.*)`);

  const newFields: typeof state.fields = {};

  Object.keys(state.fields).forEach((key) => {
    const tokens = pattern.exec(key);

    if (tokens) {
      const fieldIndex = Number(tokens[1]);

      if (fieldIndex >= index) {
        // Shift all higher indices up
        const incrementedKey = `${name}[${fieldIndex + 1}]${tokens[2]}`;

        copyField(state.fields, key, newFields, incrementedKey);

        return;
      }
    }

    // Keep this field that does not match the name,
    // or has index smaller than what is being inserted
    newFields[key] = state.fields[key];
  });

  state.fields = newFields;
};

export default insert;
