import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";
import { BoundMutator } from "final-form";

import { ArrayElement } from "./types";

type UpdateArguments<
  FormValues extends FormValuesShape = FormValuesShape,
  Key extends string = string,
> = [
  name: Key,
  index: number,
  value: FormValues[Key] extends any[] ? ArrayElement<FormValues[Key]> : any,
];

type UpdateResult = void;

/** The bound `update` function. */
export type Update<FormValues extends FormValuesShape = FormValuesShape> =
  BoundMutator<
    UpdateMutator<FormValues>,
    UpdateArguments<FormValues>,
    UpdateResult,
    FormValues
  > &
    (<Key extends string>(
      ...args: UpdateArguments<FormValues, Key>
    ) => UpdateResult);

/** The unbound `update` function. */
export type UpdateMutator<
  FormValues extends FormValuesShape = FormValuesShape,
> = Mutator<UpdateArguments<FormValues>, UpdateResult, FormValues> &
  (<Key extends string & keyof FormValues>(
    ...mutatorArgs: MutatorArguments<
      UpdateArguments<FormValues, Key>,
      FormValues
    >
  ) => UpdateResult);

const update: UpdateMutator = (
  ...mutatorArgs: MutatorArguments<UpdateArguments>
) => {
  const [[name, index, value], state, { changeValue }] = mutatorArgs;

  return changeValue(state, name, (array: any[] | null | undefined): any[] => {
    const copy = [...(array || [])];

    copy.splice(index, 1, value);

    return copy;
  });
};

export default update;
