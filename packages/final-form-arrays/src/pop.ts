import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";

import remove from "./remove";
import { ArrayElement } from "./types";

export type PopArguments<Key extends any = any> = [name: Key];

export interface Pop<FormValues extends FormValuesShape = FormValuesShape> {
  <Key extends keyof FormValues>(...args: PopArguments<Key>):
    | (keyof FormValues extends any[] ? ArrayElement<keyof FormValues> : any)
    | undefined;
  <Key extends string>(...args: PopArguments<Key>): any | undefined;
}

export interface PopMutator<
  FormValues extends FormValuesShape = FormValuesShape,
> extends Mutator<FormValues, PopArguments<keyof FormValues>> {
  <Key extends keyof FormValues>(
    ...mutatorArgs: MutatorArguments<PopArguments<Key>, FormValues>
  ):
    | (keyof FormValues extends any[] ? ArrayElement<keyof FormValues> : any)
    | undefined;
  <Key extends string>(
    ...mutatorArgs: MutatorArguments<PopArguments<Key>, FormValues>
  ): any | undefined;
}

const pop: PopMutator = (
  ...mutatorArgs: MutatorArguments<PopArguments<string>>
) => {
  const [[name], state, tools] = mutatorArgs;

  const { getIn } = tools;

  const array = getIn(state.formState.values, name) as any[] | undefined;

  return array && array.length > 0
    ? remove([name, array.length - 1], state, tools)
    : undefined;
};

export default pop;
