import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";
import { BoundMutator } from "final-form";

import { ArrayElement } from "./types";

type ConcatValue<
  FormValues extends FormValuesShape = FormValuesShape,
  Key extends string = string,
> = FormValues[Key] extends any[]
  ? ArrayElement<FormValues[Key]>[] // use ArrayElement<type>[] to ensure that it's an array (otherwise we get `any` in some cases)
  : any[];

/** Arguments for the `concat` mutator. */
export type ConcatArguments<
  FormValues extends FormValuesShape = FormValuesShape,
  Key extends string = string,
  ValueList extends any[] = ConcatValue<FormValues, Key>,
> = [name: Key, value: ValueList];

/** Return type for the `concat` mutator. */
export type ConcatResult = void;

/** The bound `concat` function. */
export type Concat<FormValues extends FormValuesShape = FormValuesShape> =
  BoundMutator<
    ConcatMutator<FormValues>,
    ConcatArguments<ConcatValue<FormValues>>,
    ConcatResult,
    FormValues
  > &
    (<Key extends string>(
      ...args: ConcatArguments<ConcatValue<FormValues, Key>>
    ) => ConcatResult);

/** The unbound `concat` function. */
export type ConcatMutator<
  FormValues extends FormValuesShape = FormValuesShape,
> = Mutator<
  ConcatArguments<ConcatValue<FormValues>>,
  ConcatResult,
  FormValues
> &
  (<Key extends string & keyof FormValues>(
    ...mutatorArgs: MutatorArguments<
      ConcatArguments<ConcatValue<FormValues, Key>>,
      FormValues
    >
  ) => ConcatResult);

const concat: ConcatMutator = (
  ...mutatorArgs: MutatorArguments<ConcatArguments>
) => {
  const [[name, value], state, { changeValue }] = mutatorArgs;

  changeValue(state, name, (array: any[] | null | undefined): any[] =>
    array ? [...array, ...value] : value,
  );
};

export default concat;
