import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";
import { BoundMutator } from "final-form";

import { ArrayElement } from "./types";

type PushArguments<
  FormValues extends FormValuesShape = FormValuesShape,
  Key extends string = string,
> = [
  name: Key,
  value: FormValues[Key] extends any[] ? ArrayElement<FormValues[Key]> : any,
];

type PushResult = void;

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
