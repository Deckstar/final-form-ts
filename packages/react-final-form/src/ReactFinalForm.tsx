import type {
  Config,
  FormApi,
  FormState,
  FormSubscription,
  FormSubscriptionItem,
  FormValuesShape,
  Unsubscribe,
} from "final-form";
import { createForm, formSubscriptionItems } from "final-form";
import * as React from "react";

import ReactFinalFormContext from "./context";
import { addLazyFormState } from "./getters";
import isSyntheticEvent from "./isSyntheticEvent";
import renderComponent from "./renderComponent";
import shallowEqual from "./shallowEqual";
import type { FormProps as Props, SubmitEvent } from "./types";
import type { FormRenderProps } from "./types";
import useConstant from "./useConstant";
import useWhenValueChanges from "./useWhenValueChanges";

type FullFormSubscription = Record<FormSubscriptionItem, true>;

export const all = formSubscriptionItems.reduce((result, key) => {
  result[key] = true;
  return result;
}, {} as FormSubscription) as FullFormSubscription;

function ReactFinalForm<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues extends Partial<FormValues> = Partial<FormValues>,
>(props: Props<FormValues, InitialFormValues>) {
  const {
    debug,
    decorators = [],
    destroyOnUnregister,
    form: alternateFormApi,
    initialValues,
    initialValuesEqual,
    keepDirtyOnReinitialize,
    mutators,
    onSubmit,
    subscription = all,
    validate,
    validateOnBlur,
    ...rest
  } = props;

  const config: Config<FormValues, InitialFormValues> = {
    debug,
    destroyOnUnregister,
    initialValues,
    keepDirtyOnReinitialize,
    mutators,
    onSubmit,
    validate,
    validateOnBlur,
  };

  const form: FormApi<FormValues, InitialFormValues> = useConstant(() => {
    const f = alternateFormApi || createForm(config);

    // pause validation until children register all fields on first render (unpaused in useEffect() below)
    f.pauseValidation();

    return f;
  });

  // synchronously register and unregister to query form state for our subscription on first render
  const [state, setState] = React.useState<FormState<FormValues>>(
    (): FormState<FormValues> => {
      let initialState: FormState<FormValues> = {};

      form.subscribe((formState) => {
        initialState = formState;
      }, subscription)();

      return initialState;
    },
  );

  // save a copy of state that can break through the closure
  // on the shallowEqual() line below.
  const stateRef = React.useRef<FormState<FormValues>>(state);
  stateRef.current = state;

  React.useEffect(() => {
    // We have rendered, so all fields are now registered, so we can unpause validation
    form.isValidationPaused() && form.resumeValidation();

    const unsubscriptions: Unsubscribe[] = [
      form.subscribe((formState) => {
        if (!shallowEqual(formState, stateRef.current)) {
          setState(formState);
        }
      }, subscription),
      ...(decorators
        ? decorators.map((decorator) =>
            // this noop ternary is to appease the flow gods
            decorator(form),
          )
        : []),
    ];

    return () => {
      form.pauseValidation(); // pause validation so we don't revalidate on every field deregistration

      unsubscriptions.reverse().forEach((unsubscribe) => unsubscribe());
      // don't need to resume validation here; either unmounting, or will re-run this hook with new deps
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, decorators);

  // warn about decorator changes
  if (process.env.NODE_ENV !== "production") {
    // You're never supposed to use hooks inside a conditional, but in this
    // case we can be certain that you're not going to be changing your
    // NODE_ENV between renders, so this is safe.

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useWhenValueChanges(
      decorators,
      () => {
        // eslint-disable-next-line no-console
        console.error(
          "Form decorators should not change from one render to the next as new values will be ignored",
        );
      },
      shallowEqual,
    );
  }

  // allow updatable config
  useWhenValueChanges(debug, () => {
    form.setConfig("debug", debug);
  });
  useWhenValueChanges(destroyOnUnregister, () => {
    form.destroyOnUnregister = !!destroyOnUnregister;
  });
  useWhenValueChanges(keepDirtyOnReinitialize, () => {
    form.setConfig("keepDirtyOnReinitialize", keepDirtyOnReinitialize);
  });
  useWhenValueChanges(
    initialValues,
    () => {
      form.setConfig("initialValues", initialValues);
    },
    initialValuesEqual || shallowEqual,
  );
  useWhenValueChanges(mutators, () => {
    form.setConfig("mutators", mutators);
  });
  useWhenValueChanges(onSubmit, () => {
    form.setConfig("onSubmit", onSubmit);
  });
  useWhenValueChanges(validate, () => {
    form.setConfig("validate", validate);
  });
  useWhenValueChanges(validateOnBlur, () => {
    form.setConfig("validateOnBlur", validateOnBlur);
  });

  const handleSubmit = (event: SubmitEvent | null | undefined) => {
    if (event) {
      // sometimes not true, e.g. React Native
      if (typeof event.preventDefault === "function") {
        event.preventDefault();
      }
      if (typeof event.stopPropagation === "function") {
        // prevent any outer forms from receiving the event too
        event.stopPropagation();
      }
    }
    return form.submit();
  };

  const renderProps: FormRenderProps<FormValues, InitialFormValues> = {
    form: {
      ...form,
      reset: (eventOrValues) => {
        if (isSyntheticEvent(eventOrValues)) {
          // it's a React SyntheticEvent, call reset with no arguments
          form.reset();
        } else {
          form.reset(eventOrValues);
        }
      },
    },
    handleSubmit,
  };

  addLazyFormState(renderProps, state);

  return React.createElement(
    ReactFinalFormContext.Provider,
    { value: form },
    // @ts-ignore
    renderComponent(rest, renderProps, "ReactFinalForm"),
  );
}

export default ReactFinalForm;
