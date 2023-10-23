import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";
import { BoundMutator } from "final-form";

import { ArrayElement } from "./types";

type PushValue<
  FormValues extends FormValuesShape = FormValuesShape,
  Key extends string = string,
> = FormValues[Key] extends any[] ? ArrayElement<FormValues[Key]> : any;

/** Arguments for the `push` mutator. */
export type PushArguments<
  FormValues extends FormValuesShape = FormValuesShape,
  Key extends string = string,
  Value extends any = PushValue<FormValues, Key>,
> = [name: Key, value: Value];

/** Return type for the `push` mutator. */
export type PushResult = void;

/** The bound `push` function. */
export type Push<FormValues extends FormValuesShape = FormValuesShape> =
  BoundMutator<
    PushMutator<FormValues>,
    PushArguments<FormValues>,
    PushResult,
    FormValues
  > &
    (<Key extends string>(
      ...args: PushArguments<FormValues, Key>
    ) => PushResult);

/** The unbound `push` function. */
export type PushMutator<FormValues extends FormValuesShape = FormValuesShape> =
  Mutator<PushArguments<FormValues>, PushResult, FormValues> &
    (<Key extends string & keyof FormValues>(
      ...mutatorArgs: MutatorArguments<
        PushArguments<FormValues, Key>,
        FormValues
      >
    ) => PushResult);

const push: PushMutator = (...mutatorArgs: MutatorArguments<PushArguments>) => {
  const [[name, value], state, { changeValue }] = mutatorArgs;

  changeValue(state, name, (array: any[] | null | undefined): any[] =>
    array ? [...array, value] : [value],
  );
};

export default push;
