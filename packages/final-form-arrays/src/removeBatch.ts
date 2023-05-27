import type { FormValuesShape, Mutator, MutatorArguments } from "final-form";

import copyField from "./copyField";
import { escapeRegexTokens } from "./utils";

const binarySearch = (list: number[], value: number): number => {
  // This algorithm assumes the items in list is unique
  let first = 0;
  let last = list.length - 1;
  let middle = 0;

  while (first <= last) {
    middle = Math.floor((first + last) / 2);
    if (list[middle] === value) {
      return middle;
    }

    if (list[middle] > value) {
      last = middle - 1;
    } else {
      first = middle + 1;
    }
  }

  return ~first;
};

export type RemoveBatchArguments<Key extends any = any> = [
  name: Key,
  indexes: number[],
];

export interface RemoveBatch<
  FormValues extends FormValuesShape = FormValuesShape,
> {
  <Key extends keyof FormValues>(
    ...args: RemoveBatchArguments<Key>
  ): keyof FormValues extends any[] ? keyof FormValues : any[];
  <Key extends string>(...args: RemoveBatchArguments<Key>): any[];
}

export interface RemoveBatchMutator<
  FormValues extends FormValuesShape = FormValuesShape,
> extends Mutator<FormValues, RemoveBatchArguments<keyof FormValues>> {
  <Key extends keyof FormValues>(
    ...mutatorArgs: MutatorArguments<RemoveBatchArguments<Key>, FormValues>
  ): keyof FormValues extends any[] ? keyof FormValues : any[];
  <Key extends string>(
    ...mutatorArgs: MutatorArguments<RemoveBatchArguments<Key>, FormValues>
  ): any[];
}

const removeBatch: RemoveBatchMutator = (
  ...mutatorArgs: MutatorArguments<RemoveBatchArguments<string>>
) => {
  const [[name, indexes], state, { changeValue }] = mutatorArgs;

  if (indexes.length === 0) {
    return [];
  }

  const sortedIndexes: number[] = [...indexes].sort();

  // Remove duplicates
  for (let i = sortedIndexes.length - 1; i > 0; i -= 1) {
    if (sortedIndexes[i] === sortedIndexes[i - 1]) {
      sortedIndexes.splice(i, 1);
    }
  }

  let returnValue: any[] = [];

  changeValue(
    state,
    name,
    (array: any[] | null | undefined): any[] | null | undefined => {
      // use original order of indexes for return value
      returnValue = indexes.map((index) => array && array[index]);

      if (!array) {
        return array;
      }

      const copy = [...array];

      for (let i = sortedIndexes.length - 1; i >= 0; i -= 1) {
        const index = sortedIndexes[i];

        copy.splice(index, 1);
      }

      return copy.length > 0 ? copy : undefined;
    },
  );

  // now we have to remove any subfields for our indexes,
  // and decrement all higher indexes.
  const pattern = new RegExp(`^${escapeRegexTokens(name)}\\[(\\d+)\\](.*)`);

  const newFields: typeof state.fields = {};

  Object.keys(state.fields).forEach((key) => {
    const tokens = pattern.exec(key);

    if (tokens) {
      const fieldIndex = Number(tokens[1]);

      const indexOfFieldIndex = binarySearch(sortedIndexes, fieldIndex);

      if (indexOfFieldIndex >= 0) {
        // One of the removed indices
        return;
      }

      if (fieldIndex > sortedIndexes[0]) {
        // Shift all higher indices down
        const decrementedKey = `${name}[${fieldIndex - ~indexOfFieldIndex}]${
          tokens[2]
        }`;

        copyField(state.fields, key, newFields, decrementedKey);

        return;
      }
    }

    // Keep this field that does not match the name,
    // or has index smaller than what is being removed
    newFields[key] = state.fields[key];
  });

  state.fields = newFields;

  return returnValue;
};

export default removeBatch;
