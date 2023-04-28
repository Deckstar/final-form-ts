import * as React from "react";
import type { FieldProps as Props, FieldRenderProps } from "./types";
import renderComponent from "./renderComponent";
import useField from "./useField";

function FieldComponent<
  FieldValue,
  RP extends FieldRenderProps<FieldValue, T, InputValue>,
  T extends HTMLElement = HTMLElement,
  InputValue = FieldValue,
>(
  props: Props<FieldValue, RP, T, InputValue>,
  ref: React.ForwardedRef<React.ReactNode>,
) {
  const {
    afterSubmit,
    allowNull,
    beforeSubmit,
    children,
    component,
    data,
    defaultValue,
    format,
    formatOnBlur,
    initialValue,
    isEqual,
    multiple,
    name,
    parse,
    subscription,
    type,
    validate,
    validateFields,
    value,
    ...rest
  } = props;

  const field: FieldRenderProps<FieldValue, T, InputValue> = useField(name, {
    afterSubmit,
    allowNull,
    beforeSubmit,
    children,
    component,
    data,
    defaultValue,
    format,
    formatOnBlur,
    initialValue,
    isEqual,
    multiple,
    parse,
    subscription,
    type,
    validate,
    validateFields,
    value,
  });

  if (typeof children === "function") {
    // @ts-ignore
    return children({ ...field, ...rest });
  }

  if (typeof component === "string") {
    // ignore meta, combine input with any other props
    return React.createElement(component, {
      ...field.input,
      children,
      ref,
      ...rest,
    });
  }

  if (!name) {
    throw new Error("prop name cannot be undefined in <Field> component");
  }

  return renderComponent(
    // @ts-ignore
    { children, component, ref, ...rest },
    field,
    `Field(${name})`,
  );
}

const Field = React.forwardRef(FieldComponent) as <
  FieldValue,
  RP extends FieldRenderProps<FieldValue, T, InputValue>,
  T extends HTMLElement = HTMLElement,
  InputValue = FieldValue,
>(
  props: Props<FieldValue, RP, T, InputValue> & {
    ref?: React.Ref<React.ReactNode>;
  },
) => React.ReactElement;

export default Field;
