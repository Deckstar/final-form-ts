import FormSpy from "./FormSpy";
import Form from "./ReactFinalForm";

export { default as FieldComponent } from "./Field";
export { default as FormSpy } from "./FormSpy";
export { default as Form } from "./ReactFinalForm";
export { default as useField } from "./useField";
export { default as useForm } from "./useForm";
export { default as useFormState } from "./useFormState";

export function withTypes() {
  return { Form, FormSpy };
}
