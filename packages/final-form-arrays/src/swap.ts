import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";

import copyField from "./copyField";

export type SwapArguments<Key extends any = any> = [
  name: Key,
  indexA: number,
  indexB: number,
];

export interface Swap<FormValues extends FormValuesShape = FormValuesShape> {
  <Key extends keyof FormValues>(...args: SwapArguments<Key>): void;
  <Key extends string>(...args: SwapArguments<Key>): void;
}

export interface SwapMutator<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> extends Mutator<
    FormValues,
    InitialFormValues,
    SwapArguments<keyof FormValues>
  > {
  <Key extends keyof FormValues>(
    ...mutatorArgs: MutatorArguments<
      SwapArguments<Key>,
      FormValues,
      InitialFormValues
    >
  ): void;
  <Key extends string>(
    ...mutatorArgs: MutatorArguments<
      SwapArguments<Key>,
      FormValues,
      InitialFormValues
    >
  ): void;
}

const swap: SwapMutator = (
  ...mutatorArgs: MutatorArguments<SwapArguments<string>>
) => {
  const [[name, indexA, indexB], state, { changeValue }] = mutatorArgs;

  if (indexA === indexB) {
    return;
  }

  changeValue(state, name, (array: any[] | null | undefined): any[] => {
    const copy = [...(array || [])];
    const a = copy[indexA];

    copy[indexA] = copy[indexB];
    copy[indexB] = a;

    return copy;
  });

  // swap all field state that begin with "name[indexA]" with that under "name[indexB]"
  const aPrefix = `${name}[${indexA}]`;
  const bPrefix = `${name}[${indexB}]`;

  const newFields: typeof state.fields = {};

  Object.keys(state.fields).forEach((key) => {
    if (key.substring(0, aPrefix.length) === aPrefix) {
      const suffix = key.substring(aPrefix.length);
      const newKey = bPrefix + suffix;

      copyField(state.fields, key, newFields, newKey);
    } else if (key.substring(0, bPrefix.length) === bPrefix) {
      const suffix = key.substring(bPrefix.length);
      const newKey = aPrefix + suffix;

      copyField(state.fields, key, newFields, newKey);
    } else {
      // Keep this field that does not match the name
      newFields[key] = state.fields[key];
    }
  });

  state.fields = newFields;
};

export default swap;
