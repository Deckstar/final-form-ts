import type { FormValuesShape } from "final-form";

import isSyntheticEvent from "./isSyntheticEvent";
import renderComponent from "./renderComponent";
import type {
  FormSpyPropsWithForm as Props,
  FormSpyRenderProps,
} from "./types";
import useForm from "./useForm";
import useFormState from "./useFormState";

function FormSpy<FormValues extends FormValuesShape = FormValuesShape>({
  onChange,
  subscription,
  ...rest
}: Props<FormValues>) {
  const reactFinalForm = useForm<FormValues>("FormSpy");
  const state = useFormState({ onChange, subscription });

  if (onChange) {
    return null;
  }

  const renderProps: FormSpyRenderProps<FormValues> = {
    form: {
      ...reactFinalForm,
      reset: (eventOrValues) => {
        if (isSyntheticEvent(eventOrValues)) {
          // it's a React SyntheticEvent, call reset with no arguments
          reactFinalForm.reset();
        } else {
          reactFinalForm.reset(eventOrValues);
        }
      },
    },
  };

  return renderComponent(
    {
      ...rest,
      ...renderProps,
    },
    state,
    "FormSpy",
  );
}

export default FormSpy;
