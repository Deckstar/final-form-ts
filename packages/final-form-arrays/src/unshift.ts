import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";

import insert from "./insert";
import { ArrayElement } from "./types";

export type UnshiftArguments<Key extends any = any, Value extends any = any> = [
  name: Key,
  value: Value,
];

export interface Unshift<FormValues extends FormValuesShape = FormValuesShape> {
  <Key extends keyof FormValues>(
    ...args: UnshiftArguments<Key, ArrayElement<FormValues[Key]>>
  ): void;
  <Key extends string>(...args: UnshiftArguments<Key>): void;
}

export interface UnshiftMutator<
  FormValues extends FormValuesShape = FormValuesShape,
> extends Mutator<FormValues, UnshiftArguments<keyof FormValues>> {
  <Key extends keyof FormValues>(
    ...mutatorArgs: MutatorArguments<
      UnshiftArguments<Key, ArrayElement<FormValues[Key]>>,
      FormValues
    >
  ): void;
  <Key extends string>(
    ...mutatorArgs: MutatorArguments<UnshiftArguments<Key>, FormValues>
  ): void;
}

const unshift: UnshiftMutator = (
  ...mutatorArgs: MutatorArguments<UnshiftArguments<string>>
) => {
  const [[name, value], state, tools] = mutatorArgs;

  return insert([name, 0, value], state, tools);
};

export default unshift;
