import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";

import copyField from "./copyField";
import { ArrayElement } from "./types";
import { escapeRegexTokens } from "./utils";

export type InsertArguments<Key extends any = any, Value extends any = any> = [
  name: Key,
  index: number,
  value: Value,
];

export interface Insert<FormValues extends FormValuesShape = FormValuesShape> {
  <Key extends keyof FormValues>(
    ...args: InsertArguments<Key, ArrayElement<FormValues[Key]>>
  ): void;
  <Key extends string>(...args: InsertArguments<Key>): void;
}

export interface InsertMutator<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> extends Mutator<
    FormValues,
    InitialFormValues,
    InsertArguments<keyof FormValues>
  > {
  <Key extends keyof FormValues>(
    ...mutatorArgs: MutatorArguments<
      InsertArguments<Key, ArrayElement<FormValues[Key]>>,
      FormValues,
      InitialFormValues
    >
  ): void;
  <Key extends string>(
    ...mutatorArgs: MutatorArguments<
      InsertArguments<Key>,
      FormValues,
      InitialFormValues
    >
  ): void;
}

const insert: InsertMutator = (
  ...mutatorArgs: MutatorArguments<InsertArguments<string>>
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
