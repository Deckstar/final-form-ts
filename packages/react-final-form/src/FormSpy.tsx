import type { FormSubscription, FormValuesShape } from "final-form";

import isSyntheticEvent from "./isSyntheticEvent";
import renderComponent from "./renderComponent";
import type {
  FormSpyPropsWithForm as Props,
  FormSpyRenderProps,
} from "./types";
import useForm from "./useForm";
import useFormState from "./useFormState";

function FormSpy<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
  FS extends FormSubscription = Required<FormSubscription>,
>({
  onChange,
  subscription,
  ...rest
}: Props<FormValues, InitialFormValues, FS>) {
  const reactFinalForm = useForm<FormValues, InitialFormValues>("FormSpy");
  const state = useFormState<FormValues, InitialFormValues, FS>({
    onChange,
    subscription,
  });

  if (onChange) {
    return null;
  }

  const renderProps: Pick<
    FormSpyRenderProps<FormValues, InitialFormValues, FS>,
    "form"
  > = {
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
    } as FormSpyRenderProps<FormValues, InitialFormValues, FS>,
    state,
    "FormSpy",
  );
}

export default FormSpy;
