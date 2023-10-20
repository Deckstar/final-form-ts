import {
  FieldSubscription,
  FormValuesShape,
  FullFieldSubscription,
  Mutators,
} from "final-form";
import {
  BoundArrayMutators,
  DefaultBoundArrayMutators,
} from "final-form-arrays";
import { FieldRenderProps } from "react-final-form";

import renderComponent from "./renderComponent";
import type { FieldArrayProps } from "./types";
import useFieldArray from "./useFieldArray";

/** A component that takes `FieldArrayProps` and renders an array of fields. */
const FieldArray = <
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
>({
  name,
  subscription,
  defaultValue,
  initialValue,
  isEqual,
  validate,
  ...rest
}: FieldArrayProps<
  FieldValue,
  FormValues,
  Subscription,
  MutatorsAfterBinding,
  T,
  RP
>) => {
  const { fields, meta } = useFieldArray<
    FieldValue,
    FormValues,
    Subscription,
    MutatorsAfterBinding,
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
