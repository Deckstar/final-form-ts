import { BoundMutators, FieldSubscription, FormValuesShape } from "final-form";

import renderComponent from "./renderComponent";
import type { FieldArrayProps } from "./types";
import useFieldArray from "./useFieldArray";
import { Mutators } from "final-form-arrays/src";
import { FieldRenderProps, FullFieldSubscription } from "react-final-form/src";

const FieldArray = <
  FieldValue = any,
  FormValues extends FormValuesShape = FormValuesShape,
  T extends HTMLElement = HTMLInputElement,
  Functions extends BoundMutators<FormValues> &
    Mutators<FormValues> = Mutators<FormValues>,
  RP extends FieldRenderProps<FieldValue[], FieldValue[], T> = FieldRenderProps<
    FieldValue[],
    FieldValue[],
    T
  >,
  Subscription extends FieldSubscription = FullFieldSubscription,
>({
  name,
  subscription,
  defaultValue,
  initialValue,
  isEqual,
  validate,
  ...rest
}: FieldArrayProps<FieldValue, FormValues, T, Functions, RP, Subscription>) => {
  const { fields, meta } = useFieldArray<
    FieldValue,
    FormValues,
    T,
    Functions,
    RP,
    Subscription
  >(name, {
    subscription,
    defaultValue,
    initialValue,
    isEqual,
    validate,
  });

  return renderComponent(
    {
      fields,
      meta,
      ...rest,
    },
    `FieldArray(${name})`,
  );
};

export default FieldArray;
