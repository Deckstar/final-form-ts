import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";

export type ConcatArguments<
  Key extends any = any,
  ArrayValue extends any[] = any[],
> = [name: Key, value: ArrayValue];

export interface Concat<FormValues extends FormValuesShape = FormValuesShape> {
  <Key extends keyof FormValues>(
    ...args: ConcatArguments<Key, FormValues[Key]>
  ): void;
  <Key extends string>(...args: ConcatArguments<Key>): void;
}

export interface ConcatMutator<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
> extends Mutator<
    FormValues,
    InitialFormValues,
    ConcatArguments<keyof FormValues>
  > {
  <Key extends keyof FormValues>(
    ...mutatorArgs: MutatorArguments<
      ConcatArguments<Key, FormValues[Key]>,
      FormValues,
      InitialFormValues
    >
  ): void;
  <Key extends string>(
    ...mutatorArgs: MutatorArguments<
      ConcatArguments<Key>,
      FormValues,
      InitialFormValues
    >
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
