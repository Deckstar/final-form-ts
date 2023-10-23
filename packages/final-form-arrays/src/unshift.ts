import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";
import { BoundMutator } from "final-form";

import insert from "./insert";
import { ArrayElement } from "./types";

type UnshiftValue<
  FormValues extends FormValuesShape = FormValuesShape,
  Key extends string = string,
> = FormValues[Key] extends any[] ? ArrayElement<FormValues[Key]> : any;

/** Arguments for the `unshift` mutator. */
export type UnshiftArguments<
  FormValues extends FormValuesShape = FormValuesShape,
  Key extends string = string,
  Value extends any = UnshiftValue<FormValues, Key>,
> = [name: Key, value: Value];

/** Return type for the `unshift` mutator. */
export type UnshiftResult = void;

/** The bound `unshift` function. */
export type Unshift<FormValues extends FormValuesShape = FormValuesShape> =
  BoundMutator<
    UnshiftMutator<FormValues>,
    UnshiftArguments<FormValues>,
    UnshiftResult,
    FormValues
  > &
    (<Key extends string>(
      ...args: UnshiftArguments<FormValues, Key>
    ) => UnshiftResult);

/** The unbound `unshift` function. */
export type UnshiftMutator<
  FormValues extends FormValuesShape = FormValuesShape,
> = Mutator<UnshiftArguments<FormValues>, UnshiftResult, FormValues> &
  (<Key extends string & keyof FormValues>(
    ...mutatorArgs: MutatorArguments<
      UnshiftArguments<FormValues, Key>,
      FormValues
    >
  ) => UnshiftResult);

const unshift: UnshiftMutator = (
  ...mutatorArgs: MutatorArguments<UnshiftArguments>
) => {
  const [[name, value], state, tools] = mutatorArgs;

  return insert([name, 0, value], state, tools);
};

export default unshift;
