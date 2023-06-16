import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";
import { BoundMutator } from "final-form";

import remove from "./remove";
import { ArrayElement } from "./types";

export type PopArguments<Key extends any = any> = [name: Key];

export interface Pop<FormValues extends FormValuesShape = FormValuesShape>
  extends BoundMutator<PopMutator<FormValues>, PopArguments, any, FormValues> {
  <Key extends keyof FormValues>(...args: PopArguments<Key>):
    | (FormValues[Key] extends any[] ? ArrayElement<FormValues[Key]> : any)
    | undefined;
  <Key extends string>(...args: PopArguments<Key>): any | undefined;
}

export interface PopMutator<
  FormValues extends FormValuesShape = FormValuesShape,
> extends Mutator<PopArguments<keyof FormValues>, unknown, FormValues> {
  <Key extends keyof FormValues>(
    ...mutatorArgs: MutatorArguments<PopArguments<Key>, FormValues>
  ):
    | (FormValues[Key] extends any[] ? ArrayElement<FormValues[Key]> : any)
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
