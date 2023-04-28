import * as React from "react";
import type {
  FormApi,
  Config,
  Decorator,
  FormState,
  FormSubscription,
  FormValuesShape,
  FieldSubscription,
  FieldValidator,
  FieldState,
} from "final-form";

export interface AnyObject {
  [key: string]: any;
}

type SupportedInputs = "input" | "select" | "textarea";

export interface ReactContext<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> {
  reactFinalForm: FormApi<FormValues, InitialFormValues>;
}

export interface FieldInputProps<
  FieldValue,
  T extends HTMLElement = HTMLElement,
> extends AnyObject {
  name: string;
  onBlur: (event?: React.FocusEvent<T>) => void;
  onChange: (event: React.ChangeEvent<T> | any) => void;
  onFocus: (event?: React.FocusEvent<T>) => void;
  type?: string;
  value: FieldValue;
  checked?: boolean;
  multiple?: boolean;
}

export type FieldMetaState<FieldValue> = Pick<
  FieldState<FieldValue>,
  Exclude<
    keyof FieldState<FieldValue>,
    "blur" | "change" | "focus" | "name" | "value"
  >
>;

export interface FieldRenderProps<
  FieldValue,
  T extends HTMLElement = HTMLElement,
  InputValue = FieldValue,
> {
  input: FieldInputProps<InputValue, T>;
  meta: FieldMetaState<FieldValue>;
  [otherProp: string]: any;
}

export type SubmitEvent = Partial<
  Pick<React.SyntheticEvent, "preventDefault" | "stopPropagation">
>;

export interface FormRenderProps<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> extends FormState<FormValues, InitialFormValues>,
    RenderableProps<FormRenderProps<FormValues>> {
  form: FormApi<FormValues>;
  handleSubmit: (
    event?: Partial<
      Pick<React.SyntheticEvent, "preventDefault" | "stopPropagation">
    >,
  ) => Promise<AnyObject | undefined> | undefined;
}

export interface FormSpyRenderProps<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> extends FormState<FormValues, InitialFormValues> {
  form: FormApi<FormValues, InitialFormValues>;
}

export interface RenderableProps<T> {
  children?: ((props: T) => React.ReactNode) | React.ReactNode;
  component?: React.ComponentType<T> | SupportedInputs;
  render?: (props: T) => React.ReactNode;
}

export interface FormProps<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> extends Config<FormValues, InitialFormValues>,
    RenderableProps<FormRenderProps<FormValues, InitialFormValues>> {
  subscription?: FormSubscription;
  decorators?: Array<Decorator<FormValues, InitialFormValues>>;
  form?: FormApi<FormValues, InitialFormValues>;
  initialValuesEqual?: (a?: AnyObject, b?: AnyObject) => boolean;
  [otherProp: string]: any;
}

export interface UseFieldConfig<
  FieldValue,
  InputValue = any,
  T extends HTMLElement = HTMLElement,
> extends Pick<RenderableProps<T>, "children" | "component"> {
  afterSubmit?: () => void;
  allowNull?: boolean;
  beforeSubmit?: () => void | false;
  data?: AnyObject;
  defaultValue?: FieldValue;
  format?: (value: FieldValue, name: string) => InputValue;
  formatOnBlur?: boolean;
  initialValue?: FieldValue;
  isEqual?: (a: any, b: any) => boolean;
  multiple?: boolean;
  parse?: (value: InputValue, name: string) => FieldValue;
  subscription?: FieldSubscription;
  type?: string;
  validate?: FieldValidator<FieldValue>;
  validateFields?: string[];
  value?: FieldValue;
}

export interface FieldProps<
  FieldValue,
  RP extends FieldRenderProps<FieldValue, T, InputValue>,
  T extends HTMLElement = HTMLElement,
  InputValue = FieldValue,
> extends UseFieldConfig<FieldValue, InputValue, T>,
    Omit<RenderableProps<RP>, "children" | "component"> {
  name: string;
  [otherProp: string]: any;
}

export interface UseFormStateParams<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> {
  onChange?: (formState: FormState<FormValues, InitialFormValues>) => void;
  subscription?: FormSubscription;
}

export interface FormSpyProps<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> extends UseFormStateParams<FormValues, InitialFormValues>,
    RenderableProps<FormSpyRenderProps<FormValues, InitialFormValues>> {}

export type FormSpyPropsWithForm<
  FormValues extends FormValuesShape = FormValuesShape,
> = {
  reactFinalForm: FormApi<FormValues>;
} & FormSpyProps<FormValues>;
