import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";

import remove from "./remove";
import { ArrayElement } from "./types";

export type ShiftArguments<Key extends any = any> = [name: Key];

export interface Shift<FormValues extends FormValuesShape = FormValuesShape> {
  <Key extends keyof FormValues>(...args: ShiftArguments<Key>):
    | (keyof FormValues extends any[] ? ArrayElement<keyof FormValues> : any)
    | undefined;
  <Key extends string>(...args: ShiftArguments<Key>): any | undefined;
}

export interface ShiftMutator<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> extends Mutator<
    FormValues,
    InitialFormValues,
    ShiftArguments<keyof FormValues>
  > {
  <Key extends keyof FormValues>(
    ...mutatorArgs: MutatorArguments<
      ShiftArguments<Key>,
      FormValues,
      InitialFormValues
    >
  ):
    | (keyof FormValues extends any[] ? ArrayElement<keyof FormValues> : any)
    | undefined;
  <Key extends string>(
    ...mutatorArgs: MutatorArguments<
      ShiftArguments<Key>,
      FormValues,
      InitialFormValues
    >
  ): any | undefined;
}

const shift: ShiftMutator = (
  ...mutatorArgs: MutatorArguments<ShiftArguments<string>>
) => {
  const [[name], state, tools] = mutatorArgs;

  return remove([name, 0], state, tools);
};

export default shift;
