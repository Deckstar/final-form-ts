import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";
import { BoundMutator } from "final-form";

import { ArrayElement } from "./types";

export type PushArguments<Key extends any = any, Value extends any = any> = [
  name: Key,
  value: Value,
];

export interface Push<FormValues extends FormValuesShape = FormValuesShape>
  extends BoundMutator<
    PushMutator<FormValues>,
    PushArguments,
    void,
    FormValues
  > {
  <Key extends keyof FormValues>(
    ...args: PushArguments<Key, ArrayElement<FormValues[Key]>>
  ): void;
  <Key extends string>(...args: PushArguments<Key>): void;
}

export interface PushMutator<
  FormValues extends FormValuesShape = FormValuesShape,
> extends Mutator<PushArguments<keyof FormValues>, void, FormValues> {
  <Key extends keyof FormValues>(
    ...mutatorArgs: MutatorArguments<
      PushArguments<Key, ArrayElement<FormValues[Key]>>,
      FormValues
    >
  ): void;
  <Key extends string>(
    ...mutatorArgs: MutatorArguments<PushArguments<Key>, FormValues>
  ): void;
}

const push: PushMutator = (
  ...mutatorArgs: MutatorArguments<PushArguments<string>>
) => {
  const [[name, value], state, { changeValue }] = mutatorArgs;

  changeValue(state, name, (array: any[] | null | undefined): any[] =>
    array ? [...array, value] : [value],
  );
};

export default push;
