import type { FieldSubscription, FieldValidator } from "final-form";
import {
  ARRAY_ERROR,
  fieldSubscriptionItems,
  FormValuesShape,
} from "final-form";
import type { DefaultType, Mutators } from "final-form-arrays";
import { useMemo } from "react";
import { useField, useForm } from "react-final-form";

import defaultIsEqual from "./defaultIsEqual";
import type { FieldArrayRenderProps, UseFieldArrayConfig } from "./types";
import useConstant from "./useConstant";

const all: FieldSubscription = fieldSubscriptionItems.reduce((result, key) => {
  result[key] = true;

  return result;
}, {} as FieldSubscription);

const useFieldArray = <
  FieldValue,
  FormValues extends FormValuesShape = FormValuesShape,
  T extends HTMLElement = HTMLInputElement,
>(
  name: string,
  {
    subscription = all,
    defaultValue,
    initialValue,
    isEqual = defaultIsEqual,
    validate: validateProp,
  }: UseFieldArrayConfig<FieldValue, FormValues, T> = {},
): FieldArrayRenderProps<FieldValue, FormValues> => {
  const form = useForm("useFieldArray");

  type MutatorFunctions = typeof form.mutators & DefaultType;
  type MutatorsWithArrayMutators = typeof form.mutators & Mutators;

  const formMutators = form.mutators as MutatorFunctions;

  // @ts-expect-error
  const hasMutators = !!(formMutators && formMutators.push && formMutators.pop);
  if (!hasMutators) {
    throw new Error(
      "Array mutators not found. You need to provide the mutators from final-form-arrays to your form",
    );
  }

  const mutators = useMemo<MutatorsWithArrayMutators>(
    () =>
      // curry the field name onto all mutator calls
      Object.keys(formMutators).reduce((result, key) => {
        result[key] = (...args) => formMutators[key](name, ...args);

        return result;
      }, {} as MutatorsWithArrayMutators),
    [name, formMutators],
  );

  const validate: FieldValidator<FieldValue[], FormValues> = useConstant(
    () => (value, allValues, meta) => {
      if (!validateProp) return undefined;

      const error = validateProp(value, allValues, meta);
      if (!error || Array.isArray(error)) {
        return error;
      } else {
        const arrayError: any[] = [];

        // gross, but we have to set a string key on the array
        // @ts-expect-error
        arrayError[ARRAY_ERROR] = error;
        return arrayError;
      }
    },
  );

  const {
    meta: { length, ...meta },
    input,
    ...fieldState
  } = useField<FieldValue[], FormValues, FieldValue[], T>(name, {
    subscription: { ...subscription, length: true },
    defaultValue,
    initialValue,
    isEqual,
    validate,
    format: (v) => v,
  });

  const forEach = (iterator: (name: string, index: number) => void): void => {
    const len = length || 0;

    for (let i = 0; i < len; i++) {
      iterator(`${name}[${i}]`, i);
    }
  };

  const map = (iterator: (name: string, index: number) => any): any[] => {
    const len = length || 0;

    const results: any[] = [];
    for (let i = 0; i < len; i++) {
      results.push(iterator(`${name}[${i}]`, i));
    }

    return results;
  };

  return {
    fields: {
      name,
      forEach,
      length: length || 0,
      map,
      ...mutators,
      ...fieldState,
      value: input.value,
    },
    meta,
  };
};

export default useFieldArray;
