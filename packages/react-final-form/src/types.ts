import type {
  AnyObject,
  Config,
  Decorator,
  FieldConfig,
  FieldState,
  FieldSubscription,
  FieldValidator,
  FormApi,
  FormStateBasedOnSubscription,
  FormSubscription,
  FormValuesShape,
  FullFieldSubscription,
  FullFormSubscription,
  StateBasedOnSubscription,
} from "final-form";
import * as React from "react";

type SupportedInputs = "input" | "select" | "textarea";

export interface ReactContext<
  FormValues extends FormValuesShape = FormValuesShape,
> {
  reactFinalForm: FormApi<FormValues>;
}

/** The field input props that must always be included. */
interface DefiniteFieldInputProps<
  InputValue = any,
  T extends HTMLElement = HTMLInputElement,
> {
  /** The name of the field. */
  name: string;
  /**
   * The `onBlur` function can take a synthetic
   * `FocusEvent` like it would if you had given it
   * directly to an `<input/>` component, but you can
   * also just call it: `props.input.onBlur()` to mark
   * the field as blurred (inactive).
   */
  onBlur: (event?: React.FocusEvent<T>) => void;
  /**
   * The `onChange` function can take a synthetic
   * `InputEvent` like it would if you had given it
   * directly to an `<input/>` component (in which case
   * it will read the value out of `event.target.value`),
   * but you can also just call it: `props.input.onChange(value)`
   * to update the value of the field.
   */
  onChange: (event: React.ChangeEvent<T> | any) => void;
  /**
   * The `onFocus` function can take a synthetic
   * `FocusEvent` like it would if you had given it
   * directly to an `<input/>` component, but you can
   * also just call it: `props.input.onFocus()` to mark
   * the field as focused (active).
   */
  onFocus: (event?: React.FocusEvent<T>) => void;
  type?: string;
  /**
   * The current value of the field.
   *
   * May not be present if you have not subscribed to
   * `value`.
   */
  value?: InputValue;
  checked?: boolean;
  multiple?: boolean;
}

export interface FieldInputProps<
  InputValue = any,
  T extends HTMLElement = HTMLInputElement,
> extends AnyObject,
    DefiniteFieldInputProps<InputValue, T> {}

export type FieldInputPropsBasedOnSubscription<
  InputValue = any,
  Subscription extends FieldSubscription = FullFieldSubscription,
  T extends HTMLElement = HTMLInputElement,
> = StateBasedOnSubscription<
  DefiniteFieldInputProps<InputValue, T>,
  Subscription,
  FieldSubscription
>;

type FieldMetaStateKeys = Exclude<
  keyof FieldState,
  "blur" | "change" | "focus" | "name" | "value"
>;

export type FieldMetaState<
  FieldValue = any,
  Subscription extends FieldSubscription = FullFieldSubscription,
> = StateBasedOnSubscription<
  Pick<FieldState<FieldValue>, FieldMetaStateKeys>,
  Subscription,
  FieldSubscription
>;

/**
 * These are the props that `<Field/>` provides to your
 * render function or component.
 *
 * This object separates out the values and event
 * handlers intended to be given to the input component
 * from the `meta` data about the field. The `input` can
 * be destructured directly into an `<input/>` like so:
 * `<input {...props.input}/>`. Keep in mind that **the
 * values in `meta` are dependent on you having
 * subscribed to them** with the `subscription` prop.
 */
export interface FieldRenderProps<
  FieldValue = any,
  InputValue = FieldValue,
  Subscription extends FieldSubscription = FullFieldSubscription,
  T extends HTMLElement = HTMLInputElement,
> {
  /**
   * The values and event handlers intended to be given
   * to the input component.
   *
   * The `input` can be destructured directly into an
   * `<input/>` like so: `<input {...props.input}/>`.
   */
  input: FieldInputPropsBasedOnSubscription<InputValue, Subscription, T>;
  /**
   * `meta` data about the field.
   *
   * Keep in mind that **the values in `meta` are
   * dependent on you having subscribed to them** with
   * the `subscription` prop.
   */
  meta: FieldMetaState<FieldValue, Subscription>;
  [otherProp: string]: any;
}

export type SubmitEvent = Partial<
  Pick<React.SyntheticEvent, "preventDefault" | "stopPropagation">
>;

export type FormRenderProps<
  FormValues extends FormValuesShape = FormValuesShape,
  Subscription extends FormSubscription = FullFormSubscription,
> = FormStateBasedOnSubscription<FormValues, Subscription> & {
  /** The `FormApi`. */
  form: FormApi<FormValues>;
  /**
   * A function intended for you to give directly to the
   * `<form>` tag:
   *
   * <!-- prettier-ignore -->
   * ```tsx
   * <form onSubmit={handleSubmit}>
   *    ... fields go here ...
   * </form>
   * ```
   *
   * The function's return type depends on the way the `onSubmit` function is written.
   *
   * Related:
   * - [`SyntheticEvent`](https://reactjs.org/docs/events.html)
   */
  handleSubmit: (
    event?: Partial<
      Pick<React.SyntheticEvent, "preventDefault" | "stopPropagation">
    >,
  ) => Promise<AnyObject | undefined> | undefined;
};

export type FormSpyRenderProps<
  FormValues extends FormValuesShape = FormValuesShape,
  Subscription extends FormSubscription = FullFormSubscription,
> = FormStateBasedOnSubscription<FormValues, Subscription> &
  Pick<FormRenderProps<FormValues, Subscription>, "form">;

/**
 * Props that can be used to render content, namely
 * `children`, `component` or `render`.
 *
 * The components will receive `RenderProps` as parameters.
 *
 * ---
 *  * Note that if you specify `render` or `component`
 * _and_ `children`, `render` will be called, with
 * `children` injected as if it were an additional
 * prop. This can be especially useful for doing
 * something like:
 *
 * ```tsx
 * <Field name="favoriteColor" component="select">
 *   <option value="FF0000">Red</option>
 *   <option value="00FF00">Green</option>
 *   <option value="0000FF">Blue</option>
 * </Field>
 * ```
 */
export interface RenderableProps<RenderProps extends AnyObject = {}> {
  /**
   * A render function that is given `FieldRenderProps`,
   * as well as any non-API props passed into the
   * `<Field/>` component. For example, if you did...
   *
   * ```tsx
   * <Field name="myField" someArbitraryOtherProp={42}>
   *   {props => {
   *     console.log(props.someArbitraryOtherProp) // would print 42
   *     return <input {...props.input}/>
   *   }}
   * </Field>
   * ```
   *
   * Note that if you specify `render` or `component`
   * _and_ `children`, `render` will be called, with
   * `children` injected as if it were an additional
   * prop. This can be especially useful for doing
   * something like:
   *
   * ```tsx
   * <Field name="favoriteColor" component="select">
   *   <option value="FF0000">Red</option>
   *   <option value="00FF00">Green</option>
   *   <option value="0000FF">Blue</option>
   * </Field>
   * ```
   *
   * Related:
   * - `FieldRenderProps`
   */
  children?:
    | ((
        props: RenderProps,
      ) => React.ReactElement<RenderProps> | React.ReactNode)
    | (React.ReactElement<RenderProps> | React.ReactNode);
  /**
   * If you are not using `'input'`, `'select`' or
   * `'textarea'`, it is recommended that you use
   * `children` or `render`.
   *
   * Either the `string` name of one of the default HTML
   * inputs, or a component that is given
   * `FieldRenderProps` as props, children and render
   * props, as well as any non-API props passed into the
   * `<Field/>` component. For example, if you did...
   *
   * <!-- prettier-ignore -->
   * ```tsx
   * <Field
   *   name="myField"
   *   someArbitraryOtherProp={42}
   *   component={MyFieldComp} />
   *
   * const MyFieldComp = props => {
   *   console.log(props.someArbitraryOtherProp) // would print 42
   *   return <input {...props.input} />
   * }
   * ```
   *
   * Related:
   * - `FieldRenderProps`
   */
  component?: React.ComponentType<RenderProps> | SupportedInputs;
  /**
   * A render function that is given `FieldRenderProps`,
   * as well as any non-API props passed into the
   * `<Field/>` component. For example, if you did...
   *
   * ```tsx
   * <Field
   *   name="myField"
   *   someArbitraryOtherProp={42}
   *   render={props => {
   *     console.log(props.someArbitraryOtherProp) // would print 42
   *     return <input {...props.input} />
   *   }}
   * />
   * ```
   *
   * Note that if you specify `render` _and_ `children`,
   * `render` will be called, with `children` injected as
   * if it were an additional prop.
   *
   * Related:
   * - `FieldRenderProps`
   */
  render?: (
    props: RenderProps,
  ) => React.ReactNode | React.ReactElement<RenderProps>;
}

export type FormProps<
  FormValues extends FormValuesShape = FormValuesShape,
  Subscription extends FormSubscription = FullFormSubscription,
> = Config<FormValues> &
  RenderableProps<FormRenderProps<FormValues, Subscription>> & {
    /**
     * _Advanced Usage_
     *
     * An object of the parts of `FormState` to subscribe
     * to. If a subscription is provided, the `<Form/>`
     * will only rerender when those parts of form state
     * change.
     *
     * If no `subscription` is provided, it will default to
     * subscribing to _all_ form state changes. i.e.
     * `<Form/>` will rerender whenever any part of the
     * form state changes.
     *
     * Related:
     * - `FormState`
     */
    subscription?: Subscription;
    /**
     * An array of decorators to apply to the form.
     * `<Form/>` will undecorate the form on unmount.
     *
     * Related:
     * - `Decorator`
     */
    decorators?: Array<Decorator<FormValues>>;
    /**
     * _Advanced Usage_
     *
     * If you'd like to construct your own Final Form
     * `form` instance using `createForm()`, you may do so
     * and pass it into `<Form/>` as a prop. Doing so will
     * ignore all the other config props.
     *
     * Related:
     * - `FormApi`
     */
    form?: FormApi<FormValues>;
    /**
     * A predicate to determine whether or not the
     * `initialValues` prop has changed, i.e. to know if
     * the form needs to be reinitialized with the new
     * values. Useful for passing in a "deep equals"
     * function if you need to. Defaults to "shallow equals".
     */
    initialValuesEqual?: (a?: AnyObject, b?: AnyObject) => boolean;
    [otherProp: string]: any;
  };

export interface UseFieldConfig<
  FieldValue = any,
  FormValues extends FormValuesShape = FormValuesShape,
  InputValue = any,
  Subscription extends FieldSubscription = FullFieldSubscription,
  T extends HTMLElement = HTMLInputElement,
> extends Pick<
      RenderableProps<
        FieldRenderProps<FieldValue, InputValue, Subscription, T>
      >,
      "children" | "component"
    >,
    Pick<
      FieldConfig<FieldValue, FormValues>,
      | "afterSubmit"
      | "beforeSubmit"
      | "data"
      | "defaultValue"
      | "initialValue"
      | "isEqual"
      | "validateFields"
    > {
  /**
   * By default, if your value is `null`, `<Field/>` will
   * convert it to `''`, to ensure
   * [controlled inputs](https://reactjs.org/docs/forms.html#controlled-components).
   *
   * But if you pass `true` to `allowNull`, `<Field/>`
   * will give you a `null` value.
   */
  allowNull?: boolean;
  /**
   * A function that takes the value from the form values
   * and the name of the field and formats the value to
   * give to the input. Common use cases include
   * converting javascript `Date` values into a localized
   * date string. Almost always used in conjunction with
   * `parse`.
   *
   * **Note: If you would like to disable the default
   * behavior of converting `undefined` to `''`, you can
   * pass an [identity function](https://en.wikipedia.org/wiki/Identity_function),
   * `v => v`, to `format`. If you do this, making sure
   * your inputs are "controlled" is up to you.**
   */
  format?: (fieldValue: FieldValue, name: string) => InputValue;
  /**
   * If `true`, the `format` function will only be called
   * when the field is blurred. If `false`, `format` will
   * be called on every render.
   */
  formatOnBlur?: boolean;
  /**
   * Only of use when using `component="select"` and you
   * want a multiselect.
   *
   * It will be added on your input component, or you may
   * retrieve its value inside the "input" property of
   * your custom components.
   */
  multiple?: boolean;
  /**
   * A function that takes the value from the input and
   * name of the field and converts the value into the
   * value you want stored as this field's value in the
   * form. Common use cases include converting strings
   * into `Number`s or parsing localized dates into
   * actual javascript `Date` objects. Almost always used
   * in conjunction with `format`.
   *
   * **Note: If would like to override the default
   * behavior of converting `''` to `undefined`, you can
   * pass an [identity function](https://en.wikipedia.org/wiki/Identity_function),
   * `v => v`, to `parse`, thus allowing you to have form
   * values of `''`.**
   */
  parse?: (inputValue: InputValue, name: string) => FieldValue;
  /**
   * An object of the parts of `FieldState` to subscribe
   * to. If a subscription is provided, the `<Field/>`
   * will only rerender when those parts of field state
   * change.
   *
   * If no `subscription` is provided, it will default to
   * subscribing to _all_ field state changes. i.e.
   * `<Field/>` will rerender whenever any part of the
   * field state changes.
   *
   * Related:
   * - `FieldState`
   */
  subscription?: Subscription;
  /**
   * If set to `"checkbox"` or `"radio"`, React Final
   * Form will know to manage your values as a checkbox
   * or radio button respectively. Results in a `checked`
   * boolean inside the `input` value given to your
   * render prop.
   *
   * It will be added on your input component, or you may
   * retrieve its value inside the "input" property of
   * your custom components
   */
  type?: string;
  /**
   * A function that takes the field value, all the
   * values of the form and the `meta` data about the
   * field and returns an error if the value is invalid,
   * or `undefined` if the value is valid.
   *
   * ⚠️ IMPORTANT ⚠️ – By default, in order to allow
   * inline fat-arrow validation functions, the field
   * will not rerender if you change your validation
   * function to an alternate function that has a
   * different behavior. If you need your field to
   * rerender with a new validation function, you will
   * need to update another prop on the `Field`, such as
   * `key`.
   */
  validate?: FieldValidator<FieldValue, FormValues>;
  /**
   * **This is only used for checkboxes and radio
   * buttons!**
   *
   * You must also include a `type="radio"` or
   * `type="checkbox"` prop.
   *
   * ### Radio Buttons
   *
   * The value of the radio button. The radio button will
   * render as `checked` if and only if the value given
   * here `===` the value for the field in the form.
   *
   * ### Checkboxes
   *
   * #### With `value`
   *
   * The checkbox will be `checked` if the value given in
   * `value` is contained in the array that is the value
   * for the field for the form. Checking the box will
   * add the value to the array, and unchecking the
   * checkbox will remove the value from the array.
   *
   * #### Without `value`
   *
   * The checkbox will be `checked` if the value is
   * truthy. Checking the box will set the value to
   * `true`, and unchecking the checkbox will set the
   * value to `false`.
   *
   */
  value?: FieldValue;
}

/**
 * These are props that you pass to `<Field/>`.
 *
 * You must provide one of the ways to render:
 * `component`, `render`, or `children`.
 */
export interface FieldProps<
  FieldValue = any,
  InputValue = FieldValue,
  FormValues extends FormValuesShape = FormValuesShape,
  Subscription extends FieldSubscription = FullFieldSubscription,
  T extends HTMLElement = HTMLInputElement,
> extends UseFieldConfig<FieldValue, FormValues, InputValue, Subscription, T>,
    RenderableProps<FieldRenderProps<FieldValue, InputValue, Subscription, T>> {
  name: string;
  [otherProp: string]: any;
}

export interface UseFormStateParams<
  FormValues extends FormValuesShape = FormValuesShape,
  Subscription extends FormSubscription = FullFormSubscription,
> {
  onChange?: (
    formState: FormStateBasedOnSubscription<FormValues, Subscription>,
  ) => void;
  subscription?: Subscription;
}

export interface FormSpyProps<
  FormValues extends FormValuesShape = FormValuesShape,
  FS extends FormSubscription = Required<FormSubscription>,
> extends UseFormStateParams<FormValues, FS>,
    RenderableProps<FormSpyRenderProps<FormValues, FS>> {}

export type FormSpyPropsWithForm<
  FormValues extends FormValuesShape = FormValuesShape,
  FS extends FormSubscription = Required<FormSubscription>,
> = {
  reactFinalForm?: FormApi<FormValues>;
} & FormSpyProps<FormValues, FS>;
