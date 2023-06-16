import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";
import { BoundMutator } from "final-form";

export type ConcatArguments<
  Key extends any = any,
  ArrayValue extends any[] = any[],
> = [name: Key, value: ArrayValue];

export interface Concat<FormValues extends FormValuesShape = FormValuesShape>
  extends BoundMutator<
    ConcatMutator<FormValues>,
    ConcatArguments,
    void,
    FormValues
  > {
  <Key extends keyof FormValues>(
    ...args: ConcatArguments<Key, FormValues[Key]>
  ): void;
  <Key extends string>(...args: ConcatArguments<Key>): void;
}

export interface ConcatMutator<
  FormValues extends FormValuesShape = FormValuesShape,
> extends Mutator<ConcatArguments<keyof FormValues>, void, FormValues> {
  <Key extends keyof FormValues>(
    ...mutatorArgs: MutatorArguments<
      ConcatArguments<Key, FormValues[Key]>,
      FormValues
    >
  ): void;
  <Key extends string>(
    ...mutatorArgs: MutatorArguments<ConcatArguments<Key>, FormValues>
  ): void;
}

const concat: ConcatMutator = (
  ...mutatorArgs: MutatorArguments<ConcatArguments<string>>
) => {
  const [[name, value], state, { changeValue }] = mutatorArgs;

  changeValue(state, name, (array: any[] | null | undefined): any[] =>
    array ? [...array, ...value] : value,
  );
};

export default concat;
