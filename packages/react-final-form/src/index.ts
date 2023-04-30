import FormSpy from "./FormSpy";
import Form from "./ReactFinalForm";

export { default as FieldComponent } from "./Field";
export { default as FormSpy } from "./FormSpy";
export { default as Form } from "./ReactFinalForm";
export {
  FieldInputProps,
  FieldMetaState,
  FieldProps,
  FieldRenderProps,
  FormProps,
  FormRenderProps,
  FormSpyProps,
  FormSpyPropsWithForm,
  FormSpyRenderProps,
  ReactContext,
  RenderableProps,
  SubmitEvent,
  UseFieldConfig,
  UseFormStateParams,
} from "./types";
export { default as useField } from "./useField";
export { default as useForm } from "./useForm";
export { default as useFormState } from "./useFormState";

export function withTypes() {
  return { Form, FormSpy };
}
