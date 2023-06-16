import { BoundMutators } from "final-form";
import { Mutator } from "final-form";
import { FormValuesShape } from "final-form";

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

/**
 * Like a regular `Mutator`, but with stricter arguments.
 *
 * In an array mutator, the first argument must be the field name.
 */
export type ArrayMutator<
  FormValues extends FormValuesShape = FormValuesShape,
  Arguments extends [name: string, ...others: any[]] = [
    name: string,
    ...others: any[],
  ],
  Result extends any = any,
> = Mutator<Arguments, Result, FormValues>;

/**
 * Like regular `Mutator`s, but with stricter arguments.
 *
 * In an array mutator, the first argument must be the field name.
 */
export type ArrayMutators<
  FormValues extends FormValuesShape = FormValuesShape,
> = {
  [mutator: string]: ArrayMutator<FormValues>;
};

/**
 * A general shape for bound array mutators.
 *
 * The `BoundArrayMutators` type must extend this type.
 */
export type BoundArrayMutators<
  UnboundMutators extends ArrayMutators<FormValues> = {},
  FormValues extends FormValuesShape = FormValuesShape,
> = BoundMutators<UnboundMutators, FormValues>;
