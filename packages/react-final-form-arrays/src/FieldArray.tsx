import { BoundMutators, FieldSubscription, FormValuesShape } from "final-form";

import renderComponent from "./renderComponent";
import type { FieldArrayProps } from "./types";
import useFieldArray from "./useFieldArray";
import { BoundArrayMutators } from "final-form-arrays/src";
import { FieldRenderProps, FullFieldSubscription } from "react-final-form/src";

const FieldArray = <
  FieldValue = any,
  FormValues extends FormValuesShape = FormValuesShape,
  Subscription extends FieldSubscription = FullFieldSubscription,
  Mutators extends BoundMutators<FormValues> &
    BoundArrayMutators<FormValues> = BoundArrayMutators<FormValues>,
  T extends HTMLElement = HTMLInputElement,
  RP extends FieldRenderProps<
    FieldValue[],
    FieldValue[],
    Subscription,
    T
  > = FieldRenderProps<FieldValue[], FieldValue[], Subscription, T>,
>({
  name,
  subscription,
  defaultValue,
  initialValue,
  isEqual,
  validate,
  ...rest
}: FieldArrayProps<FieldValue, FormValues, Subscription, Mutators, T, RP>) => {
  const { fields, meta } = useFieldArray<
    FieldValue,
    FormValues,
    Subscription,
    Mutators,
    T,
    RP
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
