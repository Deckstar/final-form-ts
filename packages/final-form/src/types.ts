import fieldSubscriptionItems from "./fieldSubscriptionItems";
import formSubscriptionItems from "./formSubscriptionItems";
import { GetIn } from "./structure/getIn";
import { SetIn } from "./structure/setIn";

export interface AnyObject {
  [key: string]: any;
}

export type Subscriber<V = any> = (value: V) => void;
export type IsEqual = (a: any, b: any) => boolean;

export type FormValuesShape = Record<string, any>;

export type ValidationErrorsShape = Record<keyof FormValuesShape, any>;

export type ValidationErrors = ValidationErrorsShape | undefined;
export type SubmissionErrors = ValidationErrors;

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type FormSubscriptionItem = ArrayElement<typeof formSubscriptionItems>;

export type FormSubscription = Partial<Record<FormSubscriptionItem, boolean>>;

type FormBooleanStates<FormValues extends FormValuesShape = FormValuesShape> =
  Partial<Record<keyof FormValues | string, boolean>>;

/**
 * By default: all values are subscribed. If subscription is
 * specified, some values may be `undefined`.
 */
export interface FormState<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
> {
  /**
   * The name of the currently active field. `undefined`
   * if none are active.
   */
  active?: string;
  /**
   * `true` if the form values are different from the
   * values it was initialized with. `false` otherwise.
   *
   * Comparison is done with shallow-equals.
   */
  dirty?: boolean;
  /**
   * An object full of booleans, with a value of `true`
   * for each `dirty` field. _Pristine fields will not
   * appear in this object_.
   *
   * Note that this is a flat object, so if your field
   * name is `addresses.shipping.street`, the `dirty`
   * value for that field will be available under
   * `dirty['addresses.shipping.street']`.
   */
  dirtyFields?: FormBooleanStates<FormValues>;
  /**
   * An object full of booleans, with a value of `true`
   * for each field that has a different value from the
   * one when the form was last submitted. _Pristine
   * (since last submit) fields will not appear in this
   * object_.
   *
   * Note that this is a flat object, so if your field
   * name is `addresses.shipping.street`, the
   * `dirtySinceLastSubmit` value for that field will be
   * available under `dirty['addresses.shipping.street']`.
   */
  dirtyFieldsSinceLastSubmit?: Partial<
    Record<keyof FormValues | string, boolean>
  >;
  /**
   * `true` if the form values are different from the
   * values it was last submitted with. `false`
   * otherwise.
   *
   * Comparison is done with shallow-equals.
   */
  dirtySinceLastSubmit?: boolean;
  /**
   * The whole-form error returned by a validation
   * function under the `FORM_ERROR` key.
   */
  error?: any;
  /**
   * An object containing all the current validation
   * errors. The shape will match the shape of the form's
   * values.
   */
  errors?: ValidationErrors;
  /**
   * `true` when the form currently has submit errors.
   * Useful for distinguishing _why_ `invalid` is `true`.
   */
  hasSubmitErrors?: boolean;
  /**
   * `true` when the form currently has validation
   * errors. Useful for distinguishing _why_ `invalid` is
   * `true`.
   *
   * For example, if your form is `invalid` because of a
   * submit error, you might also want to disable the
   * submit button if user's changes to fix the submit
   * errors causes the form to have sync validation
   * errors.
   */
  hasValidationErrors?: boolean;
  /**
   * The values the form was initialized with.
   * `undefined` if the form was never initialized.
   */
  initialValues?: InitialFormValues;
  /**
   * `true` if any of the fields or the form has a
   * validation or submission error. `false` otherwise.
   *
   * Note that a form can be invalid even if the errors
   * do not belong to any currently registered fields.
   */
  invalid?: boolean;
  /**
   * An object full of booleans, with a boolean value for
   * each field name denoting whether that field is
   * `modified` or not.
   *
   * Note that this is a flat object,  so if your field
   * name is `addresses.shipping. street`, the `modified`
   * value for that field will be available under
   * `modified['addresses.shipping.street']`.
   */
  modified?: FormBooleanStates<FormValues>;
  /**
   * `true` if the form values have ever been changed
   * since the last submission. false otherwise.
   */
  modifiedSinceLastSubmit?: boolean;
  /**
   * `true` if the form values are the same as the
   * initial values. `false` otherwise.
   *
   * Comparison is done with shallow-equals.
   */
  pristine?: boolean;
  /**
   * The whole-form submission error returned by
   * `onSubmit` under the `FORM_ERROR` key.
   */
  submitError?: any;
  /**
   * An object containing all the current submission
   * errors. The shape will match the shape of the form's
   * values.
   */
  submitErrors?: SubmissionErrors;
  /**
   * `true` if the form was submitted, but the submission
   * failed with submission errors. `false` otherwise.
   */
  submitFailed?: boolean;
  /**
   * `true` if the form was successfully submitted.
   * `false` otherwise.
   */
  submitSucceeded?: boolean;
  /**
   * `true` if the form is currently being submitted
   * asynchronously. `false` otherwise.
   */
  submitting?: boolean;
  /**
   * An object full of booleans, with a boolean value for
   * each field name denoting whether that field is
   * `touched` or not.
   *
   * Note that this is a flat object, so if your field
   * name is `addresses.shipping.street`, the `touched`
   * value for that field will be available under
   * `touched['addresses.shipping.street']`.
   */
  touched?: FormBooleanStates<FormValues>;
  /**
   * `true` if neither the form nor any of its fields has
   * a validation or submission error. `false` otherwise.
   *
   * Note that a form can be invalid even if the errors do
   * not belong to any currently registered fields.
   */
  valid?: boolean;
  /**
   * `true` if the form is currently being validated
   * asynchronously. `false` otherwise.
   */
  validating?: boolean;
  /** The current values of the form. */
  values?: FormValues;
  /**
   * An object full of booleans, with a boolean value for
   * each field name denoting whether that field is
   * `visited` or not.
   *
   * Note that this is a flat object,  so if your field
   * name is `addresses.shipping.street`, the `visited`
   * value for that field will be available under
   * `visited['addresses.shipping.street']`.
   */
  visited?: FormBooleanStates<FormValues>;
}

export type FormSubscriber<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
> = Subscriber<FormState<FormValues, InitialFormValues>>;

/**
 * `FieldState` is an object containing the following
 * values. **Depending on your subscription when calling
 * `form.registerField()`, some of the values may not be
 * present.**
 */
export interface FieldState<
  FieldValue = any,
  FormValues extends FormValuesShape = FormValuesShape,
> {
  /** Whether or not the field currently has focus. */
  active?: boolean;
  /**
   * A function to blur the field (mark it as inactive). */
  blur: () => void;
  /** A function to change the value of the field. */
  change: (value: FieldValue | undefined) => void;
  /**
   * A place for arbitrary values to be placed by
   * mutators.
   */
  data?: FormValues;
  /**
   * `true` when the value of the field is not equal to
   * the initial value (using the `isEqual` comparator
   * provided at field registration), `false` if the
   * values are equal.
   */
  dirty?: boolean;
  /**
   * `true` when the value of the field is not equal to
   * the value last submitted (using the `isEqual`
   * comparator provided at field registration), `false`
   * if the values are equal.
   */
  dirtySinceLastSubmit?: boolean;
  /** The current validation error for this field. */
  error?: any;
  /**
   * A function to focus the field (mark it as active).
   */
  focus: () => void;
  /**
   * The initial value of the field. `undefined` if it
   * was never initialized.
   */
  initial?: FieldValue;
  /**
   * `true` if the field has a validation error or a
   * submission error. `false` otherwise.
   */
  invalid?: boolean;
  /**
   * The length of the array if the value is an array.
   * `undefined` otherwise.
   */
  length?: FieldValue extends any[] ? number : undefined;
  /**
   * `true` if this field's value has ever been changed.
   * `false` otherwise.
   *
   * Once `true`, it will remain `true` for the lifetime * of the field, or until the form or field state is
   * reset.
   */
  modified?: boolean;
  /**
   * `true` if this field's value has ever been changed
   * since the last submission. `false` otherwise.
   *
   * Once `true`, it will remain `true` until the next
   * submit action, or until the form or field state is
   * reset.
   */
  modifiedSinceLastSubmit?: boolean;
  /** The name of the field. */
  name: string;
  /**
   * `true` if the current value is `===` to the initial
   * value, `false` if the values are `!==`.
   */
  pristine?: boolean;
  /** The submission error for this field. */
  submitError?: any;
  /**
   * `true` if a form submission has been tried and
   * failed. `false` otherwise.
   */
  submitFailed?: boolean;
  /**
   * `true` if the form has been successfully submitted.
   * `false` otherwise.
   */
  submitSucceeded?: boolean;
  /**
   * `true` if the form is currently being submitted
   * asynchronously. `false` otherwise.
   */
  submitting?: boolean;
  /**
   * `true` if this field has ever gained and lost focus.
   * `false` otherwise.
   *
   * Useful for knowing when to display error messages.
   */
  touched?: boolean;
  /**
   * `true` if this field has no validation or submission
   * errors. `false` otherwise.
   */
  valid?: boolean;
  /**
   * `true` if this field is currently waiting on its
   * asynchronous field-level validation function to
   * resolve. `false` otherwise.
   */
  validating?: boolean;
  /** The value of the field. */
  value?: FieldValue;
  /**
   * `true` if this field has ever gained focus. `false`
   * otherwise.
   */
  visited?: boolean;
}

export type FieldSubscriptionItem = ArrayElement<typeof fieldSubscriptionItems>;

export type FieldSubscription = Partial<Record<FieldSubscriptionItem, boolean>>;

export type FieldSubscriber<
  FieldValue = any,
  FormValues extends FormValuesShape = FormValuesShape,
> = Subscriber<FieldState<FieldValue, FormValues>>;

export type Subscribers<T extends Object> = {
  index: number;
  entries: {
    [key: number]: {
      subscriber: Subscriber<T>;
      subscription: FieldSubscription;
      notified: boolean;
    };
  };
};

/**
 * Unsubscribes a listener.
 *
 * Pretty exciting, I know!
 */
export type Unsubscribe = () => void;

export type FieldValidator<
  FieldValue = any,
  FormValues extends FormValuesShape = FormValuesShape,
> = (
  value: FieldValue,
  allValues: FormValues,
  meta?: FieldState<FieldValue, FormValues>,
) => any | Promise<any>;

export type GetFieldValidator<
  FieldValue = any,
  FormValues extends FormValuesShape = FormValuesShape,
> = () => FieldValidator<FieldValue, FormValues> | undefined;

/**
 * `FieldConfig` is an object containing the following
 * values:
 */
export interface FieldConfig<
  FieldValue = any,
  FormValues extends FormValuesShape = FormValuesShape,
> {
  /**
   * A callback to notify fields after submission has
   * completed successfully.
   */
  afterSubmit?: () => void;
  /**
   * A function to call just before calling `onSubmit`.
   *
   * If `beforeSubmit` returns `false`, the submission
   * will be aborted. If one of your fields returns
   * `false` on `beforeSubmit`, other fields may not have
   * their `beforeSubmit` called, as the submission is
   * aborted on the first one that returns `false`.
   */
  beforeSubmit?: () => void | false;
  /**
   * Initial state for arbitrary values to be placed by
   * mutators.
   */
  data?: FormValues;
  /**
   * The value of the field upon creation only if both
   * the field's `initialValue` is `undefined` and the
   * value from the form's `initialValues` is also
   * `undefined`. The field will be `dirty` when
   * `defaultValue` is used.
   */
  defaultValue?: FieldValue;
  /**
   * A callback that will return a field-level validation
   * function to validate a single field value. The
   * validation function should return an error if the
   * value is not valid, or `undefined` if the value is
   * valid.
   */
  getValidator?: GetFieldValidator<FieldValue, FormValues>;
  /**
   * The initial value for the field. This value will be
   * used to calculate `dirty` and `pristine` by
   * comparing it to the current value of the field. If
   * you want field to be `dirty` upon creation, you can
   * set one value with `initialValue` and set the value
   * of the field with `defaultValue`.
   *
   * The value given here will override any
   * `initialValues` given to the entire form.
   */
  initialValue?: FieldValue;
  /** A function to determine if two values are equal. */
  isEqual?: IsEqual;
  /**
   * If `true`, no form or field listeners (apart from
   * the one currently registering) will be notified of
   * anything that has changed with the registration of
   * this field. _Shhhh!!_
   *
   * This can be useful to do a "dry run" of registering
   * a field and immediately unregistering it to get an
   * initial state for that field without disturbing all
   * the other listeners.
   *
   * Defaults to `false`.
   */
  silent?: boolean;
  /**
   * An array of field names to validate when this field
   * changes.
   *
   * - If `undefined`, _every_ field will be validated
   * when this one changes;
   * - if `[]`, _only this field_ will have its
   * field-level validation function called when it
   * changes;
   * - if other field names are specified, those fields
   * _and this one_ will be validated when this field
   * changes.
   */
  validateFields?: string[];
}

export interface RegisterField<
  FormValues extends FormValuesShape = FormValuesShape,
> {
  <F extends keyof FormValues>(
    name: F,
    subscriber: FieldSubscriber<FormValues[F], FormValues>,
    subscription?: FieldSubscription,
    config?: FieldConfig<FormValues[F], FormValues>,
  ): Unsubscribe;
  <F extends string>(
    name: F,
    subscriber: FieldSubscriber<any, FormValues>,
    subscription?: FieldSubscription,
    config?: FieldConfig<any, FormValues>,
  ): Unsubscribe;
}

/**
 * The field state as stored internally.
 *
 * Some parts of this state will be available for
 * consumption.
 */
export interface InternalFieldState<
  FieldValue = any,
  FormValues extends FormValuesShape = FormValuesShape,
> extends Partial<Pick<FieldState<FieldValue, FormValues>, "length">>,
    Required<
      Pick<
        FieldState<FieldValue, FormValues>,
        | "active"
        | "blur"
        | "change"
        | "data"
        | "focus"
        | "modified"
        | "modifiedSinceLastSubmit"
        | "name"
        | "touched"
        | "valid"
        | "validating"
        | "visited"
      >
    >,
    Partial<Pick<FieldConfig<FieldValue, FormValues>, "validateFields">>,
    Required<Pick<FieldConfig<FieldValue, FormValues>, "isEqual">> {
  /** The previous state of the field. */
  lastFieldState?: FieldState<FieldValue, FormValues>;
  /** Functions for validating this field. */
  validators: {
    [index: number]: GetFieldValidator<FieldValue, FormValues>;
  };
}

/**
 * The form state as stored internally.
 *
 * Some parts of this state will be available for consumption.
 */
export interface InternalFormState<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
> extends Partial<
      Pick<
        FormState<FormValues, InitialFormValues>,
        | "active"
        | "error"
        | "initialValues"
        | "invalid"
        | "submitError"
        | "submitErrors"
      >
    >,
    Required<
      Pick<
        FormState<FormValues, InitialFormValues>,
        | "dirtySinceLastSubmit"
        | "errors"
        | "pristine"
        | "submitFailed"
        | "submitSucceeded"
        | "submitting"
        | "valid"
        | "values"
      >
    > {
  /** Potential errors that are still being awaited. */
  asyncErrors: ValidationErrors;
  /**
   * Whether any fields have been modified since the
   * last submit.
   */
  modifiedSinceLastSubmit: boolean;
  /**
   * The form values at the last time the form was
   * submitted.
   */
  lastSubmittedValues?: FormValues;
  /**
   * Whether the form was reset while in the process
   * of being submitted (i.e. while `submitting` was
   * `true`).
   */
  resetWhileSubmitting: boolean;
  /**
   * The total count of asynchronous validations that are
   * currently being awaited.
   */
  validating: number;
}

export type ConfigKey = keyof Config;

export interface Change<FormValues extends FormValuesShape = FormValuesShape> {
  <F extends keyof FormValues>(name: F, value?: FormValues[F]): void;
  <F extends string>(name: F, value?: any): void;
}

type NonOptionalKeys<T> = {
  [Key in keyof T]-?: undefined extends T[Key] ? never : Key;
}[keyof T];

export interface GetFieldState<
  FormValues extends FormValuesShape = FormValuesShape,
> {
  <F extends keyof FormValues>(field: F): F extends NonOptionalKeys<FormValues>
    ? FieldState<FormValues[F], FormValues>
    : FieldState<FormValues[F], FormValues> | undefined;
  <F extends string>(field: F): FieldState<unknown, FormValues> | undefined;
}

/**
 * The following items exist on the object returned by
 * `createForm()`.
 */
export interface FormApi<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
> {
  /**
   * Allows batch updates by silencing notifications
   * while the `fn` is running.
   *
   * Example:
   * ```ts
   * form.batch(() => {
   *   form.change('firstName', 'Erik') // listeners not notified
   *   form.change('lastName', 'Rasmussen') // listeners not notified
   * }) // NOW all listeners notified
   * ```
   */
  batch: (fn: () => void) => void;
  /** Blurs (marks inactive) the given field. */
  blur: (name: string) => void;
  /** Changes the value of the given field. */
  change: Change<FormValues>;
  /**
   * A read/write property to get and set the
   * `destroyOnUnregister` config setting.
   */
  destroyOnUnregister: boolean;
  /** Focuses (marks active) the given field. */
  focus: (name: string) => void;
  /**
   * Returns the state of a specific field, of type
   * `FieldState`, as it was last reported to its
   * listeners, or `undefined` if the field has not been
   * registered.
   */
  getFieldState: GetFieldState<FormValues>;
  /**
   * Returns a list of all the currently registered
   * fields.
   */
  getRegisteredFields: () => string[];
  /**
   * A way to request the current state of the form
   * without subscribing.
   */
  getState: () => FormState<FormValues, InitialFormValues>;
  /**
   * Initializes the form to the values provided. All the
   * values will be set to these values, and `dirty` and
   * `pristine` will be calculated by performing a
   * shallow-equals between the current values and the
   * values last initialized with. The form will be
   * `pristine` after this call.
   */
  initialize: (
    data: InitialFormValues | ((values: FormValues) => InitialFormValues),
  ) => void;
  /**
   * Returns `true` if validation is currently paused,
   * `false` otherwise.
   */
  isValidationPaused: () => boolean;
  /**
   * The state-bound versions of the mutators provided to
   * `Config`.
   */
  mutators: { [key: string]: BoundMutator<FormValues> };
  /**
   * If called, validation will be paused until
   * `resumeValidation()` is called.
   *
   * By default, `pauseValidation` also prevents all
   * notifications being fired to their subscribers. This
   * is done performance reasons. However, if
   * notifications are still needed while validation is
   * paused, you can pass `false` to `pauseValidation`.
   */
  pauseValidation: () => void;
  /**
   * Registers a new field and subscribes to changes to
   * it. **The `subscriber` will _only_ be called, when
   * the values specified in `subscription` change.**
   * More than one subscriber can subscribe to the same
   * field.
   *
   * This is also where you may provide an optional
   * field-level validation function that should return
   * `undefined` if the value is valid, or an error. It
   * can optionally return a `Promise` that _resolves_
   * (not rejects) to `undefined` or an error.
   *
   * Related:
   * - [`FieldState`](FieldState)
   * - [`FieldConfig`](FieldConfig)
   * - [`Unsubscribe`](Unsubscribe)
   */
  registerField: RegisterField<FormValues>;
  /**
   * Resets the values back to the initial values the
   * form was initialized with. Or empties all the values
   * if the form was not initialized. If you provide
   * `initialValues` they will be used as the new initial
   * values.
   *
   * Note that if you are calling `reset()` and not
   * specify new initial values, you must call it with no
   * arguments. Be careful to avoid things like `promise.
   * catch(reset)` or `onChange={form.reset}` in React,
   * as they will get arguments passed to them and
   * reinitialize your form.
   */
  reset: (initialValues?: InitialFormValues) => void;
  /**
   * Resets all of a field's flags (e.g. `touched`,
   * `visited`, etc.) to their initial state.
   */
  resetFieldState: (name: string) => void;
  /**
   * Resets all form and field state. Same as calling
   * `reset(initialValues)` on the form and
   * `resetFieldState()` for each field. Form should be
   * just as it was when it was first created.
   */
  restart: (initialValues?: InitialFormValues) => void;
  /**
   * Resumes validation paused by `pauseValidation()`. If
   * validation was blocked while it was paused,
   * validation will be run.
   */
  resumeValidation: () => void;
  /**
   * Sets fields on the `Config` object.
   */
  setConfig: <K extends ConfigKey>(
    name: K,
    value: Config<FormValues, InitialFormValues>[K],
  ) => void;
  /**
   * Submits the form if there are currently no
   * validation errors. It may return `undefined` or a
   * `Promise` depending on the nature of the `onSubmit`
   * configuration value given to the form when it was
   * created.
   */
  submit: () => Promise<SubmissionErrors> | undefined;
  /**
   * Subscribes to changes to the form. **The
   * `subscriber` will _only_ be called when values
   * specified in `subscription` change.** A form can
   * have many subscribers.
   *
   * Related:
   * - [`FormState`](FormState)
   * - [`Unsubscribe`](Unsubscribe)
   */
  subscribe: (
    subscriber: FormSubscriber<FormValues, InitialFormValues>,
    subscription: FormSubscription,
  ) => Unsubscribe;
}

export type DebugFunction<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
> = (
  state: FormState<FormValues, InitialFormValues>,
  fieldStates: { [key: string]: FieldState<any> },
) => void;

/**
 * Unless you're writing a `Mutator`, ignore this.
 */
export interface MutableState<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
> {
  /** An object of field subscribers. */
  fieldSubscribers: { [key: string]: Subscribers<FieldState<any, FormValues>> };
  /**
   * An object of values very similar to `FieldState`.
   *
   * Note that the fields are kept in a flat structure,
   * so a "deep" field like `"shipping.address.street"`
   * will be at the key `"shipping.address.street"`, with
   * the dots included.
   */
  fields: {
    [key: string]: InternalFieldState<any, FormValues>;
  };
  /** An object very similar to `FormState`. */
  formState: InternalFormState<FormValues, InitialFormValues>;
  /**
   * The last form state sent to form subscribers. The
   * object very similar to `FormState`.
   */
  lastFormState?: FormState<FormValues, InitialFormValues>;
}

export interface ChangeValue<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
> {
  <Name extends keyof FormValues>(
    mutableState: MutableState<FormValues, InitialFormValues>,
    name: Name,
    mutate: (oldValue: FormValues[Name]) => FormValues[Name],
  ): void;
  <Name extends string>(
    mutableState: MutableState<FormValues, InitialFormValues>,
    name: Name,
    mutate: (oldValue: any) => any,
  ): void;
}
export interface RenameField<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
> {
  <Name extends keyof FormValues, NewName extends keyof FormValues>(
    mutableState: MutableState<FormValues, InitialFormValues>,
    from: Name,
    to: NewName,
  ): void;
  <Name extends string, NewName extends string>(
    mutableState: MutableState<FormValues, InitialFormValues>,
    from: Name,
    to: NewName,
  ): void;
}

type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never;

type DropFirstArg<Func extends (...args: any[]) => any> = (
  ...argsWithoutFirst: DropFirst<Parameters<Func>>
) => ReturnType<Func>;

export interface BoundMutator<FormValues> {
  <Key extends keyof FormValues>(name: Key, ...args: any[]): any;
  <Key extends string>(name: Key, ...args: any[]): any;
}

export type BoundMutators<FormValues extends FormValuesShape> = {
  [mutator: string]: BoundMutator<FormValues>;
};

export type FieldMutators<
  FormValues extends FormValuesShape = FormValuesShape,
  Functions extends BoundMutators<FormValues> = BoundMutators<FormValues>,
> = {
  [Func in keyof Functions]: DropFirstArg<Functions[Func]>;
};

/** Tools that will be passed into the functions used as `mutators`. */
export interface Tools<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
> {
  /**
   * A utility function to modify a single field value
   * in form state. `mutate()` takes the old value and
   * returns the new value.
   *
   * Related:
   * - `MutableState`
   */
  changeValue: ChangeValue<FormValues, InitialFormValues>;
  /**
   * A utility function to get any arbitrarily deep
   * value from an object using dot-and-bracket syntax
   * (e.g. `"some.deep.values[3].whatever"`).
   *
   * Related:
   * - Field Names
   */
  getIn: GetIn<FormValues>;
  /**
   * A utility function to rename a field, copying over
   * its value and field subscribers. _Advanced usage
   * only_.
   *
   * Related:
   * - `MutableState`
   */
  renameField: RenameField<FormValues, InitialFormValues>;
  /**
   * A utility function to reset all of a field's flags
   * (e.g. `touched`, `visited`, etc.) to their initial
   * state. This can be useful for inserting a new field
   * that has the same name as an existing field.
   */
  resetFieldState: (name: string) => void;
  /**
   * A utility function to set any arbitrarily deep
   * value inside an object using dot-and-bracket syntax
   * (e.g. `"some.deep.values[3].whatever"`). Note: it
   * does **not** mutate the object, but returns a new
   * object.
   *
   * Related:
   * - Field Names
   */
  setIn: SetIn<FormValues>;
  /**
   * A utility function to compare the keys of two
   * objects. Returns `true` if the objects have the
   * same keys.
   */
  shallowEqual: IsEqual;
}

export type MutatorArguments<
  Arguments extends any = any,
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
> = [
  args: Arguments,
  state: MutableState<FormValues, InitialFormValues>,
  tools: Tools<FormValues, InitialFormValues>,
];

export type Mutator<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
  Arguments extends any = any,
  Result extends any = void,
> = (
  ...mutatorArgs: MutatorArguments<Arguments, FormValues, InitialFormValues>
) => Result;

/**
 * Configuration options that are passed into the form.
 */
export interface Config<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
> {
  /**
   * A callback for debugging that receives the form
   * state and the states of all the fields. It's called
   * _on every state change_.
   *
   * A typical thing to pass in might be `console.log`.
   *
   * Related:
   * - [`FormState`](FormState)
   * - [`FieldState`](FieldState)
   */
  debug?: DebugFunction<FormValues, InitialFormValues>;
  /**
   * If `true`, the value of a field will be destroyed
   * when that field is unregistered. Defaults to
   * `false`. Can be useful when creating dynamic forms
   * where only form values displayed need be submitted.
   */
  destroyOnUnregister?: boolean;
  /**
   * The initial values of your form. These will also be
   * used to compare against the current values to
   * calculate `pristine` and `dirty`.
   *
   * If you are using Typescript, these values must be
   * the same type as the object given to your
   * `onSubmit` function.
   */
  initialValues?: InitialFormValues;
  /**
   * If `true`, only pristine values will be overwritten
   * when `initialize(newValues)` is called. This can be
   * useful for allowing a user to continue to edit a
   * record while the record is being saved
   * asynchronously, and the form is reinitialized to the
   * saved values when the save is successful. Defaults
   * to `false`.
   */
  keepDirtyOnReinitialize?: boolean;
  /** Named `Mutator` functions. */
  mutators?:
    | { [key: string]: Mutator } // Note: these mutators are purposefully flexible regarding the generic parameters. This is so the input could be easier, and so it would accept constant values.
    | { [key: string]: Mutator<FormValues, InitialFormValues> };
  /**
   * Function to call when the form is submitted. There
   * are three possible ways to write an `onSubmit`
   * function:
   *
   * ### 1. Synchronous
   *
   * Returns `undefined` on success, or an `Object` of
   * submission errors on failure.
   *
   * ### 2. Asynchronous with a callback
   *
   * Returns `undefined`, calls `callback()` with no
   * arguments on success, or with an `Object` of
   * submission errors on failure.
   *
   * ### 3. Asynchronous with a `Promise`
   *
   * Returns a `Promise<SubmissionErrors>` that resolves
   * with no value on success or _resolves_ with an
   * object of submission errors on failure. The reason
   * it  _resolves_ with errors is to leave rejection for
   * when there is a server or communications error.
   *
   * ### Submission Errors
   *
   * Submission errors must be in the same shape as the
   * values of the form. You may
   * return a generic error for the whole form (e.g.
   * `'Login Failed'`) using the special `FORM_ERROR`
   * string key.
   *
   * Related:
   * - `FormApi`
   */
  onSubmit: (
    values: FormValues,
    form: FormApi<FormValues, InitialFormValues>,
    callback?: (errors?: SubmissionErrors) => void,
  ) => SubmissionErrors | Promise<SubmissionErrors> | void;
  /**
   * A whole-record validation function that takes all
   * the values of the form and returns any validation
   * errors. There are two possible ways to write a
   * `validate` function:
   *
   * ### 1. Synchronous
   *
   * Returns `{}` or `undefined` when the values are
   * valid, or an object of validation errors when the
   * values are invalid.
   *
   * ### 2. Asynchronous with a `Promise`
   *
   * Returns a `Promise<ValidationErrors>` that resolves
   * with no value on success or _resolves_ with an
   * object of validation errors on failure. The reason
   * it _resolves_ with errors is to leave _rejection_
   * for when there is a server or communications error.
   *
   * ### Validation Errors
   *
   * Validation errors must be in the same shape as the
   * values of the form. You may return a generic error
   * for the whole form using the special `FORM_ERROR`
   * string key.
   */
  validate?: (
    values: FormValues,
  ) => ValidationErrors | Promise<ValidationErrors> | undefined;
  /**
   * If `true`, validation will happen on blur. If
   * `false`, validation will happen on change. Defaults
   * to `false`.
   */
  validateOnBlur?: boolean;
}

/**
 * `Decorator` is a function that
 * [decorates](https://en.wikipedia.org/wiki/Decorator_pattern)
 * a form by subscribing to it and making changes as the
 * form state changes, and returns an `Unsubscribe`
 * function to detach itself from the form. e.g.
 * [Final Form Calculate](https://github.com/final-form/final-form-calculate).
 *
 * Related:
 * - `FormApi`
 * - `Unsubscribe`
 *
 * ## Example Usage
 *
 * ```js
 * import { createForm } from 'final-form'
 *
 * // Create Form
 * const form = createForm({ onSubmit })
 *
 * // Decorate form
 * const undecorate = decorator(form)
 *
 * // Use form as normal
 *
 * // Clean up
 * undecorate()
 * ```
 */
export type Decorator<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
> = (form: FormApi<FormValues, InitialFormValues>) => Unsubscribe;
