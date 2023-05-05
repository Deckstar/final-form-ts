import type {
  AnyObject,
  Config,
  Decorator,
  FieldState,
  FieldSubscription,
  FieldValidator,
  FormApi,
  FormState,
  FormSubscription,
  FormValuesShape,
} from "final-form";
import * as React from "react";

import { FormStateHookResult } from "./useFormState";

type SupportedInputs = "input" | "select" | "textarea";

export interface ReactContext<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> {
  reactFinalForm: FormApi<FormValues, InitialFormValues>;
}

export interface FieldInputProps<
  FieldValue = any,
  T extends HTMLElement = HTMLInputElement,
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
  FieldValue = any,
  InputValue = FieldValue,
  T extends HTMLElement = HTMLInputElement,
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

export type FormSpyRenderProps<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
  FS extends FormSubscription = Required<FormSubscription>,
> = FormStateHookResult<FormValues, InitialFormValues, FS> & {
  form: FormApi<FormValues, InitialFormValues>;
};

export interface RenderableProps<Props = {}> {
  children?: ((props: Props) => React.ReactNode) | React.ReactNode;
  component?: React.ComponentType<Props> | SupportedInputs;
  render?: (props: Props) => React.ReactElement;
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
  FieldValue = any,
  FormValues extends FormValuesShape = FormValuesShape,
  InputValue = any,
  T extends HTMLElement = HTMLInputElement,
  RP extends FieldRenderProps<FieldValue, InputValue, T> = FieldRenderProps<
    FieldValue,
    InputValue,
    T
  >,
> extends Pick<RP, "children" | "component"> {
  afterSubmit?: () => void;
  allowNull?: boolean;
  beforeSubmit?: () => void | false;
  data?: FormValues;
  defaultValue?: FieldValue;
  format?: (value: FieldValue, name: string) => InputValue;
  formatOnBlur?: boolean;
  initialValue?: FieldValue;
  isEqual?: (a: any, b: any) => boolean;
  multiple?: boolean;
  parse?: (value: InputValue, name: string) => FieldValue;
  subscription?: FieldSubscription;
  type?: string;
  validate?: FieldValidator<FieldValue, FormValues>;
  validateFields?: string[];
  value?: FieldValue;
}

export interface FieldProps<
  FieldValue = any,
  InputValue = FieldValue,
  FormValues extends FormValuesShape = FormValuesShape,
  T extends HTMLElement = HTMLInputElement,
  RP extends FieldRenderProps<FieldValue, InputValue, T> = FieldRenderProps<
    FieldValue,
    InputValue,
    T
  >,
> extends Omit<
      UseFieldConfig<FieldValue, FormValues, InputValue, T, RP>,
      "children" | "component"
    >,
    RenderableProps<RP> {
  name: string;
  [otherProp: string]: any;
}

export interface UseFormStateParams<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
  FS extends FormSubscription = Required<FormSubscription>,
> {
  onChange?: (formState: FormState<FormValues, InitialFormValues>) => void;
  subscription?: FS;
}

export interface FormSpyProps<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
  FS extends FormSubscription = Required<FormSubscription>,
> extends UseFormStateParams<FormValues, InitialFormValues, FS>,
    RenderableProps<FormSpyRenderProps<FormValues, InitialFormValues, FS>> {}

export type FormSpyPropsWithForm<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
  FS extends FormSubscription = Required<FormSubscription>,
> = {
  reactFinalForm?: FormApi<FormValues, InitialFormValues>;
} & FormSpyProps<FormValues, InitialFormValues, FS>;
