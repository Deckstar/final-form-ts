import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";
import { BoundMutator } from "final-form";

import remove from "./remove";
import { ArrayElement } from "./types";

export type ShiftArguments<Key extends any = any> = [name: Key];

export interface Shift<FormValues extends FormValuesShape = FormValuesShape>
  extends BoundMutator<
    ShiftMutator<FormValues>,
    ShiftArguments,
    any,
    FormValues
  > {
  <Key extends keyof FormValues>(...args: ShiftArguments<Key>):
    | (FormValues[Key] extends any[] ? ArrayElement<FormValues[Key]> : any)
    | undefined;
  <Key extends string>(...args: ShiftArguments<Key>): any | undefined;
}

export interface ShiftMutator<
  FormValues extends FormValuesShape = FormValuesShape,
> extends Mutator<ShiftArguments<keyof FormValues>, unknown, FormValues> {
  <Key extends keyof FormValues>(
    ...mutatorArgs: MutatorArguments<ShiftArguments<Key>, FormValues>
  ):
    | (FormValues[Key] extends any[] ? ArrayElement<FormValues[Key]> : any)
    | undefined;
  <Key extends string>(
    ...mutatorArgs: MutatorArguments<ShiftArguments<Key>, FormValues>
  ): any | undefined;
}

const shift: ShiftMutator = (
  ...mutatorArgs: MutatorArguments<ShiftArguments<string>>
) => {
  const [[name], state, tools] = mutatorArgs;

  return remove([name, 0], state, tools);
};

export default shift;
