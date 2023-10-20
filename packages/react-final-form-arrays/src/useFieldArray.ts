import type {
  FieldSubscription,
  FieldValidator,
  FullFieldSubscription,
  Mutators,
} from "final-form";
import { ARRAY_ERROR, FormValuesShape } from "final-form";
import type {
  BoundArrayMutators,
  DefaultBoundArrayMutators,
} from "final-form-arrays";
import { useMemo } from "react";
import {
  FieldRenderProps,
  fullFieldSubscription as all,
  useField,
  useForm,
} from "react-final-form";

import defaultIsEqual from "./defaultIsEqual";
import type {
  FieldArrayMutators,
  FieldArrayRenderProps,
  UseFieldArrayConfig,
} from "./types";
import useConstant from "./useConstant";

/**
 * The `useFieldArray` hook takes two parameters, the first is the name of the field,
 * and the second is an optional object that looks just like `FieldArrayProps`, except
 * without the name. It returns an object just like `FieldArrayRenderProps`.
 *
 * `useFieldArray` is used internally inside `FieldArray`.
 */
const useFieldArray = <
  FieldValue = any,
  FormValues extends FormValuesShape = FormValuesShape,
  Subscription extends FieldSubscription = FullFieldSubscription,
  MutatorsAfterBinding extends DefaultBoundArrayMutators<FormValues> &
    BoundArrayMutators<
      Mutators<FormValues>,
      FormValues
    > = DefaultBoundArrayMutators<FormValues>,
  T extends HTMLElement = HTMLInputElement,
  RP extends FieldRenderProps<
    FieldValue[],
    FieldValue[],
    Subscription,
    T
  > = FieldRenderProps<FieldValue[], FieldValue[], Subscription, T>,
>(
  name: string,
  {
    subscription = all as Subscription,
    defaultValue,
    initialValue,
    isEqual = defaultIsEqual,
    validate: validateProp,
  }: UseFieldArrayConfig<FieldValue, FormValues, Subscription, T, RP> = {},
): FieldArrayRenderProps<
  FieldValue,
  FormValues,
  MutatorsAfterBinding,
  Subscription
> => {
  const form = useForm<FormValues>("useFieldArray");

  type FieldMutatorsObj = FieldArrayMutators<FormValues, MutatorsAfterBinding>;

  const formMutators = form.mutators as MutatorsAfterBinding;

  // @ts-expect-error
  const hasMutators = !!(formMutators && formMutators.push && formMutators.pop);
  if (!hasMutators) {
    throw new Error(
      "Array mutators not found. You need to provide the mutators from final-form-arrays to your form",
    );
  }

  const mutators = useMemo<FieldMutatorsObj>(
    () =>
      // curry the field name onto all mutator calls
      Object.keys(formMutators).reduce((result, _key) => {
        const key = _key as keyof MutatorsAfterBinding;

        const boundMutator = formMutators[key];

        type FieldMutator = FieldMutatorsObj[typeof key];

        const fieldMutator = ((...args) =>
          boundMutator(name, ...args)) as FieldMutator;

        result[key] = fieldMutator;

        return result;
      }, {} as FieldMutatorsObj),
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
  } = useField<FieldValue[], FieldValue[], FormValues, Subscription, T, RP>(
    name,
    {
      subscription: { ...subscription, length: true },
      defaultValue,
      initialValue,
      isEqual,
      validate,
      format: (v) => v,
    },
  );

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
