import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";
import { BoundMutator } from "final-form";

import remove from "./remove";
import { ArrayElement } from "./types";

type ShiftArguments<Key extends string = string> = [name: Key];

type ShiftResult<
  FormValues extends FormValuesShape = FormValuesShape,
  Key extends string = string,
> =
  | (FormValues[Key] extends any[] ? ArrayElement<FormValues[Key]> : any)
  | undefined;

/** The bound `shift` function. */
export type Shift<FormValues extends FormValuesShape = FormValuesShape> =
  BoundMutator<
    ShiftMutator<FormValues>,
    ShiftArguments,
    ShiftResult<FormValues>,
    FormValues
  > &
    (<Key extends string>(
      ...args: ShiftArguments<Key>
    ) => ShiftResult<FormValues, Key>);

/** The unbound `shift` function. */
export type ShiftMutator<FormValues extends FormValuesShape = FormValuesShape> =
  Mutator<ShiftArguments, ShiftResult<FormValues>, FormValues> &
    (<Key extends string & keyof FormValues>(
      ...mutatorArgs: MutatorArguments<ShiftArguments<Key>, FormValues>
    ) => ShiftResult<FormValues, Key>);

const shift: ShiftMutator = (
  ...mutatorArgs: MutatorArguments<ShiftArguments<string>>
) => {
  const [[name], state, tools] = mutatorArgs;

  return remove([name, 0], state, tools);
};

export default shift;
