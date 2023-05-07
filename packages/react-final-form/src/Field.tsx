import { FormValuesShape } from "final-form";
import * as React from "react";

import renderComponent from "./renderComponent";
import type { FieldProps as Props, FieldRenderProps } from "./types";
import useField from "./useField";

function FieldComponent<
  FieldValue = any,
  InputValue = FieldValue,
  FormValues extends FormValuesShape = FormValuesShape,
  T extends HTMLElement = HTMLInputElement,
  RP extends FieldRenderProps<FieldValue, InputValue, T> = FieldRenderProps<
    FieldValue,
    InputValue,
    T
  >,
>(
  props: Props<FieldValue, InputValue, FormValues, T, RP>,
  ref: React.ForwardedRef<React.ReactNode>,
): React.ReactElement {
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

  const field: FieldRenderProps<FieldValue, InputValue, T> = useField(name, {
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

/**
 * A component that registers a field with the containing
 * form, subscribes to field state, and injects both
 * field state and callback functions, `onBlur`,
 * `onChange`, and `onFocus` via a render prop.
 *
 * The `<Field/>` will rerender any time the field state
 * it is subscribed to changes. By default it subscribes
 * to _all_ field state. You can control which field
 * state it subscribes to with the `subscription` prop.
 *
 * ## Props
 *
 * `<Field/>` accepts `FieldProps` and will call the
 * render function with `FieldRenderProps`.
 *
 * The only two required props are `name` and one of `component`, `render`, or `children`.
 *
 * ## Basic Usage
 *
 * You need to do three things when using `<Field/>`:
 *
 * ### 1. Provide a `name` prop
 *
 * The name of the field can be a reference to a "deep"
 * value via dot-and-bracket syntax,
 * e.g. `'clients[0].address.street'`.
 *
 * ### 2. Provide a way to render the field
 *
 * There are four ways to render a `<Field/>` component:
 *
 * | Prop                 | Type                               |
 * | -------------------- | ---------------------------------- |
 * | `<Field component/>` | `'input' or 'select' or 'textarea'` |
 * | `<Field component/>` | `React.ComponentType`              |
 * | `<Field render/>`    | `Function`                         |
 * | `<Field children/>`  | `Function`                         |
 *
 * The only important distinction is that if you pass a
 * component to the `component` prop, it will be rendered
 * with [`React.createElement()`](https://reactjs.org/docs/react-api.html#createelement),
 * resulting in your component actually being in the
 * React node tree, i.e. inspectable in [DevTools](https://github.com/facebook/react-devtools#react-developer-tools-).
 *
 * ### 3. Connect the callbacks to your input
 *
 * If you are using `component="input"` (or `select` or
 * `textarea`), `<Field/>` will do this step for you.
 *
 * ```tsx
 * <Field name="myField" component="input" />
 * ```
 *
 * But if you are using a custom component or a render
 * prop, you will need to do this yourself.
 *
 * `<Field/>` makes this as easy as possible by bundling
 * all of the props that your input component needs into
 * one object prop, called `input`, which contains
 * `name`, `onBlur`, `onChange`, `onFocus`, and `value`.
 *
 * #### HTML Inputs
 *
 * If you're going to be using one of the standard HTML
 * inputs, `<input>`, `<select>`, or `<textarea>`, it's
 * just a matter of using [the spread operator](https://reactjs.org/docs/jsx-in-depth.html#spread-attributes)
 * to populate the props of the input.
 *
 * ```tsx
 * <Field name="myField">
 *    {props => (
 *      <div>
 *        <input {...props.input} />
 *      </div>
 *    )}
 * </Field>
 * ```
 *
 * #### Custom Inputs
 *
 * The only thing a custom input needs to do to be
 * compatible with React Final Form is to accept a
 * `value` prop and somehow call the `onChange` callback
 * to change the value.
 *
 * ```tsx
 * import TextField from '@material-ui/core/TextField'
 *
 * ...
 *
 * <Field name="myField">
 *    {props => (
 *      <div>
 *        <TextField
 *          name={props.input.name}
 *          value={props.input.value}
 *          onChange={props.input.onChange}
 *        />
 *      </div>
 *    )}
 * </Field>
 * ```
 *
 *
 * Note: To use an `array` for the values (with another
 * field type, like a tags-input component), you can do
 * `value={[...props.input.value]}` to avoid "Invalid
 * prop type of 'string' warning".
 */
const Field = React.forwardRef(FieldComponent) as <
  FieldValue = any,
  InputValue = FieldValue,
  FormValues extends FormValuesShape = FormValuesShape,
  T extends HTMLElement = HTMLInputElement,
  RP extends FieldRenderProps<FieldValue, InputValue, T> = FieldRenderProps<
    FieldValue,
    InputValue,
    T
  >,
>(
  props: Props<FieldValue, InputValue, FormValues, T, RP> & {
    ref?: React.Ref<React.ReactNode>;
  },
) => React.ReactElement;

export default Field;
