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
  InitialFormValues = Partial<FormValues>,
> {
  active?: string;
  dirty?: boolean;
  dirtyFields?: FormBooleanStates<FormValues>;
  dirtyFieldsSinceLastSubmit?: Partial<
    Record<keyof FormValues | string, boolean>
  >;
  dirtySinceLastSubmit?: boolean;
  error?: any;
  errors?: ValidationErrors;
  hasSubmitErrors?: boolean;
  hasValidationErrors?: boolean;
  initialValues?: InitialFormValues;
  invalid?: boolean;
  modified?: FormBooleanStates<FormValues>;
  modifiedSinceLastSubmit?: boolean;
  pristine?: boolean;
  submitError?: any;
  submitErrors?: SubmissionErrors;
  submitFailed?: boolean;
  submitSucceeded?: boolean;
  submitting?: boolean;
  touched?: FormBooleanStates<FormValues>;
  valid?: boolean;
  validating?: boolean;
  values?: FormValues;
  visited?: FormBooleanStates<FormValues>;
}

export type FormSubscriber<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> = Subscriber<FormState<FormValues, InitialFormValues>>;

export interface FieldState<
  FieldValue = any,
  FormValues extends FormValuesShape = FormValuesShape,
> {
  active?: boolean;
  blur: () => void;
  change: (value: FieldValue | undefined) => void;
  data?: FormValues;
  dirty?: boolean;
  dirtySinceLastSubmit?: boolean;
  error?: any;
  focus: () => void;
  initial?: FieldValue;
  invalid?: boolean;
  length?: FieldValue extends any[] ? number : undefined;
  modified?: boolean;
  modifiedSinceLastSubmit?: boolean;
  name: string;
  pristine?: boolean;
  submitError?: any;
  submitFailed?: boolean;
  submitSucceeded?: boolean;
  submitting?: boolean;
  touched?: boolean;
  valid?: boolean;
  validating?: boolean;
  value?: FieldValue;
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

export interface FieldConfig<
  FieldValue = any,
  FormValues extends FormValuesShape = FormValuesShape,
> {
  afterSubmit?: () => void;
  beforeSubmit?: () => void | false;
  data?: any;
  defaultValue?: any;
  getValidator?: GetFieldValidator<FieldValue, FormValues>;
  initialValue?: any;
  isEqual?: IsEqual;
  silent?: boolean;
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

export interface InternalFieldState<
  FieldValue = any,
  FormValues extends FormValuesShape = FormValuesShape,
> {
  active: boolean;
  blur: () => void;
  change: (value: any) => void;
  data: FormValues;
  focus: () => void;
  isEqual: IsEqual;
  lastFieldState?: FieldState<FieldValue, FormValues>;
  length?: any;
  modified: boolean;
  modifiedSinceLastSubmit: boolean;
  name: string;
  touched: boolean;
  validateFields?: string[];
  validators: {
    [index: number]: GetFieldValidator<FieldValue, FormValues>;
  };
  valid: boolean;
  validating: boolean;
  visited: boolean;
}

export interface InternalFormState<
  FormValues = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> {
  active?: string;
  asyncErrors: ValidationErrors;
  dirtySinceLastSubmit: boolean;
  modifiedSinceLastSubmit: boolean;
  error?: any;
  errors: ValidationErrors;
  initialValues?: InitialFormValues;
  invalid?: boolean;
  lastSubmittedValues?: FormValues;
  pristine: boolean;
  resetWhileSubmitting: boolean;
  submitError?: any;
  submitErrors?: ValidationErrors;
  submitFailed: boolean;
  submitSucceeded: boolean;
  submitting: boolean;
  valid: boolean;
  validating: number;
  values: FormValues;
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

export interface FormApi<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> {
  batch: (fn: () => void) => void;
  blur: (name: string) => void;
  change: Change<FormValues>;
  destroyOnUnregister: boolean;
  focus: (name: string) => void;
  initialize: (
    data: InitialFormValues | ((values: FormValues) => InitialFormValues),
  ) => void;
  isValidationPaused: () => boolean;
  getFieldState: GetFieldState<FormValues>;
  getRegisteredFields: () => string[];
  getState: () => FormState<FormValues, InitialFormValues>;
  mutators: Record<string, (...args: any[]) => any>;
  pauseValidation: () => void;
  registerField: RegisterField<FormValues>;
  reset: (initialValues?: InitialFormValues) => void;
  resetFieldState: (name: string) => void;
  restart: (initialValues?: InitialFormValues) => void;
  resumeValidation: () => void;
  setConfig: <K extends ConfigKey>(
    name: K,
    value: Config<FormValues>[K],
  ) => void;
  submit: () => Promise<SubmissionErrors> | undefined;
  subscribe: (
    subscriber: FormSubscriber<FormValues, InitialFormValues>,
    subscription: FormSubscription,
  ) => Unsubscribe;
}

export type DebugFunction<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> = (
  state: FormState<FormValues, InitialFormValues>,
  fieldStates: { [key: string]: FieldState<any> },
) => void;

export interface MutableState<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> {
  fieldSubscribers: { [key: string]: Subscribers<FieldState<any, FormValues>> };
  fields: {
    [key: string]: InternalFieldState<any, FormValues>;
  };
  formState: InternalFormState<FormValues>;
  lastFormState?: FormState<FormValues, InitialFormValues>;
}

export interface ChangeValue<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
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
  InitialFormValues = Partial<FormValues>,
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

/** Tools that will be passed into the functions used as `mutators`. */
export interface Tools<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> {
  changeValue: ChangeValue<FormValues, InitialFormValues>;
  getIn: GetIn<FormValues>;
  renameField: RenameField<FormValues, InitialFormValues>;
  resetFieldState: (name: string) => void;
  setIn: SetIn<FormValues>;
  shallowEqual: IsEqual;
}

export type MutatorArguments<
  Arguments extends any = any,
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> = [
  args: Arguments,
  state: MutableState<FormValues, InitialFormValues>,
  tools: Tools<FormValues, InitialFormValues>,
];

export type Mutator<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
  Arguments extends any = any,
  Result extends any = void,
> = (
  ...mutatorArgs: MutatorArguments<Arguments, FormValues, InitialFormValues>
) => Result;

export interface Config<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> {
  debug?: DebugFunction<FormValues, InitialFormValues>;
  destroyOnUnregister?: boolean;
  initialValues?: InitialFormValues;
  keepDirtyOnReinitialize?: boolean;
  mutators?: { [key: string]: Mutator<FormValues, InitialFormValues> };
  onSubmit: (
    values: FormValues,
    form: FormApi<FormValues, InitialFormValues>,
    callback?: (errors?: SubmissionErrors) => void,
  ) => SubmissionErrors | Promise<SubmissionErrors> | void;
  validate?: (
    values: FormValues,
  ) => ValidationErrors | Promise<ValidationErrors> | undefined;
  validateOnBlur?: boolean;
}

export type Decorator<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> = (form: FormApi<FormValues, InitialFormValues>) => Unsubscribe;
