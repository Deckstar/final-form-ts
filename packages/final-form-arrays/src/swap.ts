import type {
  BoundMutator,
  FormValuesShape,
  Mutator,
  MutatorArguments,
} from "final-form";

import copyField from "./copyField";

type SwapArguments<Key extends string = string> = [
  name: Key,
  indexA: number,
  indexB: number,
];

type SwapResult = void;

/** The bound `swap` function. */
export type Swap<FormValues extends FormValuesShape = FormValuesShape> =
  BoundMutator<SwapMutator<FormValues>, SwapArguments, SwapResult, FormValues> &
    (<Key extends string>(...args: SwapArguments<Key>) => SwapResult);

/** The unbound `swap` function. */
export type SwapMutator<FormValues extends FormValuesShape = FormValuesShape> =
  Mutator<SwapArguments, SwapResult, FormValues> &
    (<Key extends string & keyof FormValues>(
      ...mutatorArgs: MutatorArguments<SwapArguments<Key>, FormValues>
    ) => SwapResult);

const swap: SwapMutator = (
  ...mutatorArgs: MutatorArguments<SwapArguments<string>>
) => {
  const [[name, indexA, indexB], state, { changeValue }] = mutatorArgs;

  if (indexA === indexB) {
    return;
  }

  changeValue(state, name, (array: any[] | null | undefined): any[] => {
    const copy = [...(array || [])];
    const a = copy[indexA];

    copy[indexA] = copy[indexB];
    copy[indexB] = a;

    return copy;
  });

  // swap all field state that begin with "name[indexA]" with that under "name[indexB]"
  const aPrefix = `${name}[${indexA}]`;
  const bPrefix = `${name}[${indexB}]`;

  const newFields: typeof state.fields = {};

  Object.keys(state.fields).forEach((key) => {
    if (key.substring(0, aPrefix.length) === aPrefix) {
      const suffix = key.substring(aPrefix.length);
      const newKey = bPrefix + suffix;

      copyField(state.fields, key, newFields, newKey);
    } else if (key.substring(0, bPrefix.length) === bPrefix) {
      const suffix = key.substring(bPrefix.length);
      const newKey = aPrefix + suffix;

      copyField(state.fields, key, newFields, newKey);
    } else {
      // Keep this field that does not match the name
      newFields[key] = state.fields[key];
    }
  });

  state.fields = newFields;
};

export default swap;
