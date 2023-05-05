import { FormValuesShape } from "final-form";

import renderComponent from "./renderComponent";
import type { FieldArrayProps } from "./types";
import useFieldArray from "./useFieldArray";

const FieldArray = <
  FieldValue = any,
  FormValues extends FormValuesShape = FormValuesShape,
  T extends HTMLElement = HTMLInputElement,
>({
  name,
  subscription,
  defaultValue,
  initialValue,
  isEqual,
  validate,
  ...rest
}: FieldArrayProps<FieldValue, FormValues, T>) => {
  const { fields, meta } = useFieldArray<FieldValue, FormValues, T>(name, {
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
