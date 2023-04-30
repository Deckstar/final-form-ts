import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";

import { ArrayElement } from "./types";

export type UpdateArguments<Key extends any = any, Value extends any = any> = [
  name: Key,
  index: number,
  value: Value,
];

export interface Update<FormValues extends FormValuesShape = FormValuesShape> {
  <Key extends keyof FormValues>(
    ...args: UpdateArguments<Key, ArrayElement<FormValues[Key]>>
  ): void;
  <Key extends string>(...args: UpdateArguments<Key>): void;
}

export interface UpdateMutator<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> extends Mutator<
    FormValues,
    InitialFormValues,
    UpdateArguments<keyof FormValues>
  > {
  <Key extends keyof FormValues>(
    ...mutatorArgs: MutatorArguments<
      UpdateArguments<Key, ArrayElement<FormValues[Key]>>,
      FormValues,
      InitialFormValues
    >
  ): void;
  <Key extends string>(
    ...mutatorArgs: MutatorArguments<
      UpdateArguments<Key>,
      FormValues,
      InitialFormValues
    >
  ): void;
}

const update: UpdateMutator = (
  ...mutatorArgs: MutatorArguments<UpdateArguments<string>>
) => {
  const [[name, index, value], state, { changeValue }] = mutatorArgs;

  return changeValue(state, name, (array: any[] | null | undefined): any[] => {
    const copy = [...(array || [])];

    copy.splice(index, 1, value);

    return copy;
  });
};

export default update;
