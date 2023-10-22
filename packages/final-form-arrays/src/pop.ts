import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";
import { BoundMutator } from "final-form";

import remove from "./remove";
import { ArrayElement } from "./types";

type PopArguments<Key extends string = string> = [name: Key];

type PopResult<
  FormValues extends FormValuesShape = FormValuesShape,
  Key extends string = string,
> =
  | (FormValues[Key] extends any[] ? ArrayElement<FormValues[Key]> : any)
  | undefined;

/** The bound `pop` function. */
export type Pop<FormValues extends FormValuesShape = FormValuesShape> =
  BoundMutator<
    PopMutator<FormValues>,
    PopArguments,
    PopResult<FormValues>,
    FormValues
  > &
    /**
     * Note that
     *  - `Key extends string` for the bound mutator, and
     *  - `Key extends string & keyof FormValues` for the unbound one
     * is the sweet-spot for overloading our mutators.
     *
     * This way:
     *  - `pop(correctKey)` strictly only accepts `FormValues[Key]` as an argument, and returns a typed result
     *  - `pop(wrongKey)` is still allowed, and both accepts `any` as an argument, and returns `any`
     *
     * Best of both worlds!
     */
    (<Key extends string>(
      ...args: PopArguments<Key>
    ) => PopResult<FormValues, Key>);

/** The unbound `pop` function. */
export type PopMutator<FormValues extends FormValuesShape = FormValuesShape> =
  Mutator<PopArguments, PopResult<FormValues>, FormValues> &
    (<Key extends string & keyof FormValues>(
      ...mutatorArgs: MutatorArguments<PopArguments<Key>, FormValues>
    ) => PopResult<FormValues, Key>);

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
