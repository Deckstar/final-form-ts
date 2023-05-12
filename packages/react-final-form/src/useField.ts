import type {
  FieldConfig,
  FieldState,
  FieldSubscription,
  FormApi,
  FormValuesShape,
} from "final-form";
import { fieldSubscriptionItems, FieldSubscriptionItem } from "final-form";
import * as React from "react";

import { addLazyFieldMetaState } from "./getters";
import getValue from "./getValue";
import isReactNative from "./isReactNative";
import type {
  FieldInputProps,
  FieldMetaState,
  FieldRenderProps,
  UseFieldConfig,
} from "./types";
import useConstantCallback from "./useConstantCallback";
import useForm from "./useForm";
import useLatest from "./useLatest";

export type FullFieldSubscription = Record<FieldSubscriptionItem, true>;

export const all: FullFieldSubscription = fieldSubscriptionItems.reduce(
  (result, key) => {
    result[key] = true;
    return result;
  },
  {} as FullFieldSubscription,
);

const defaultFormat = (value: any, _name: string) =>
  value === undefined ? "" : value;
const defaultParse = (value: any, _name: string) =>
  value === "" ? undefined : value;

const defaultIsEqual = (a: any, b: any): boolean => a === b;

type UseFieldHookConfigParam<
  FieldValue,
  FormValues extends FormValuesShape,
  InputValue,
  T extends HTMLElement,
  RP extends FieldRenderProps<FieldValue, InputValue, T>,
  Subscription extends FieldSubscription = FullFieldSubscription,
> = Omit<
  UseFieldConfig<FieldValue, FormValues, InputValue, T, RP, Subscription>,
  "children" | "component"
> &
  Partial<
    Pick<
      UseFieldConfig<FieldValue, FormValues, InputValue, T, RP, Subscription>,
      "children" | "component"
    >
  >;

/**
 * `useField()` returns `FieldRenderProps`. It will
 * manage the rerendering of any component you use it in,
 * i.e. the component will only rerender if the field
 * state subscribed to via `useField()` changes.
 *
 * `useField()` is used internally inside `<Field/>`.
 */
function useField<
  FieldValue = any,
  InputValue = FieldValue,
  FormValues extends FormValuesShape = FormValuesShape,
  T extends HTMLElement = HTMLInputElement,
  RP extends FieldRenderProps<FieldValue, InputValue, T> = FieldRenderProps<
    FieldValue,
    InputValue,
    T
  >,
  Subscription extends FieldSubscription = FullFieldSubscription,
>(
  /** The name of the field. */
  name: string,
  /**
   * An object that looks just like `FieldProps`, except
   * without the name.
   */
  config: UseFieldHookConfigParam<
    FieldValue,
    FormValues,
    InputValue,
    T,
    RP,
    Subscription
  > = {},
): FieldRenderProps<FieldValue, InputValue, T, Subscription> {
  type ConfigParam = typeof config;

  const {
    afterSubmit,
    allowNull,
    component,
    data,
    defaultValue,
    format = defaultFormat as NonNullable<ConfigParam["format"]>,
    formatOnBlur,
    initialValue,
    multiple,
    parse = defaultParse as NonNullable<ConfigParam["parse"]>,
    subscription = all,
    type,
    validateFields,
    value: _value,
  } = config;

  const form: FormApi<FormValues> = useForm<FormValues>("useField");

  const configRef = useLatest(config);

  /**
   * Handles registering the field in the form
   * subscriptions.
   */
  const register = (
    callback: (fieldState: FieldState<FieldValue, FormValues>) => void,
    silent: FieldConfig<FieldValue, FormValues>["silent"],
  ) =>
    // avoid using `state` const in any closures created inside `register`
    // because they would refer `state` from current execution context
    // whereas actual `state` would defined in the subsequent `useField` hook
    // execution
    // (that would be caused by `setState` call performed in `register` callback)
    form.registerField(name, callback, subscription, {
      afterSubmit,
      beforeSubmit: () => {
        const {
          beforeSubmit,
          formatOnBlur: wouldFormatOnBlur,
          format: formatValue = defaultFormat,
        } = configRef.current;

        if (wouldFormatOnBlur) {
          const { value } = form.getFieldState(name)!;
          const formatted = formatValue(value!, name);

          if (formatted !== value) {
            form.change(name, formatted);
          }
        }

        return beforeSubmit && beforeSubmit();
      },
      data,
      defaultValue,
      getValidator: () => configRef.current.validate,
      initialValue,
      isEqual: (a, b) => (configRef.current.isEqual || defaultIsEqual)(a, b),
      silent,
      validateFields,
    });

  const firstRender = React.useRef(true);

  // synchronously register and unregister to query field state for our subscription on first render
  const [state, setState] = React.useState<FieldState<FieldValue, FormValues>>(
    (): FieldState<FieldValue, FormValues> => {
      // @ts-ignore
      let initialState: FieldState<FieldValue, FormValues> = {};

      // temporarily disable destroyOnUnregister
      const destroyOnUnregister = form.destroyOnUnregister;
      form.destroyOnUnregister = false;

      register((fieldState) => {
        initialState = fieldState;
      }, true)();

      // return destroyOnUnregister to its original value
      form.destroyOnUnregister = destroyOnUnregister;

      return initialState;
    },
  );

  React.useEffect(
    () =>
      register((fieldState) => {
        if (firstRender.current) {
          firstRender.current = false;
        } else {
          setState(fieldState);
        }
      }, false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      name,
      data,
      defaultValue,
      // If we want to allow inline fat-arrow field-level validation functions, we
      // cannot reregister field every time validate function !==.
      // validate,
      initialValue,
      // The validateFields array is often passed as validateFields={[]}, creating
      // a !== new array every time. If it needs to be changed, a rerender/reregister
      // can be forced by changing the key prop
      // validateFields
    ],
  );

  const meta = {} as FieldMetaState<FieldValue, Subscription>;

  addLazyFieldMetaState(meta, state);

  const input: FieldInputProps<InputValue, T> = {
    name,
    get value() {
      let value = state.value;

      if (formatOnBlur) {
        if (component === "input") {
          value = defaultFormat(value, name);
        }
      } else {
        // @ts-ignore
        value = format(value, name);
      }

      if (value === null && !allowNull) {
        // @ts-ignore
        value = "";
      }

      if (type === "checkbox" || type === "radio") {
        return _value as InputValue;
      } else if (component === "select" && multiple) {
        return (value || []) as InputValue;
      }

      return value as InputValue;
    },
    get checked() {
      let value = state.value;

      if (type === "checkbox") {
        // @ts-ignore
        value = format(value, name);

        if (_value === undefined) {
          return !!value;
        } else {
          return !!(Array.isArray(value) && ~value.indexOf(_value));
        }
      } else if (type === "radio") {
        // @ts-ignore
        return format(value, name) === _value;
      }

      return undefined;
    },
    onBlur: useConstantCallback((_event) => {
      state.blur();

      if (formatOnBlur) {
        /**
         * Here we must fetch the value directly from Final Form because we cannot
         * trust that our `state` closure has the most recent value. This is a problem
         * if-and-only-if the library consumer has called `onChange()` immediately
         * before calling `onBlur()`, but before the field has had a chance to receive
         * the value update from Final Form.
         */
        const fieldState = form.getFieldState(state.name);
        state.change(
          // @ts-expect-error
          format(fieldState.value, state.name),
        );
      }
    }),
    onChange: useConstantCallback((event: React.ChangeEvent<T> | any) => {
      if (process.env.NODE_ENV !== "production" && event && event.target) {
        const targetType = event.target.type;
        const unknown =
          ~["checkbox", "radio", "select-multiple"].indexOf(targetType) &&
          !type &&
          component !== "select";

        const value: any =
          targetType === "select-multiple" ? state.value : _value;

        if (unknown) {
          // eslint-disable-next-line no-console
          console.error(
            `You must pass \`type="${
              targetType === "select-multiple" ? "select" : targetType
            }"\` prop to your Field(${name}) component.\n` +
              `Without it we don't know how to unpack your \`value\` prop - ${
                Array.isArray(value) ? `[${value}]` : `"${value}"`
              }.`,
          );
        }
      }

      const value: InputValue =
        event && event.target
          ? getValue(event, state.value, _value, isReactNative)
          : event;

      state.change(parse(value, name));
    }),
    onFocus: useConstantCallback((_event) => state.focus()),
  };

  if (multiple) {
    input.multiple = multiple;
  }

  if (type !== undefined) {
    input.type = type;
  }

  const renderProps: FieldRenderProps<FieldValue, InputValue, T, Subscription> =
    { input, meta }; // assign to force TS check
  return renderProps;
}

export default useField;
