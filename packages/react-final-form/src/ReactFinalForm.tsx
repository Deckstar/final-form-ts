import type {
  Config,
  FormApi,
  FormStateBasedOnSubscription,
  FormSubscription,
  FormValuesShape,
  FullFormSubscription,
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

/** An object with all form subscriptions set to `true`. */
export const all = formSubscriptionItems.reduce((result, key) => {
  result[key] = true;
  return result;
}, {} as FormSubscription) as FullFormSubscription;

/**
 *
 * A component that surrounds your entire form and
 * manages the form state. It can inject form state and
 * functionality, e.g. a `handleSubmit` function for you
 * to pass to your `<form>` element, via render props.
 *
 * On mount, `<Form/>` creates a Final Form `form`
 * instance, subscribes to changes on that `form`, and
 * places it into the [React Context](https://reactjs.org/docs/context.html)
 * so that the `<Field/>` and `<FormSpy/>` components can
 * see it.
 *
 * The `<Form/>` will rerender any time the form state it
 * is subscribed to changes. By default it subscribes to
 * _all_ form state. You can control which form state it
 * subscribes to with the `subscription` prop.
 *
 * ## Props
 *
 * `<Form/>` accepts `FormProps` and will call the render
 * function with `FormRenderProps`.
 *
 * The only two required props are `onSubmit` and one of `component`, `render`, or `children`.
 *
 * ## Basic Usage
 *
 * You need to do three things when using `<Form/>`:
 *
 * ### 1. Provide an `onSubmit` prop
 *
 * `onSubmit` is a function that will be called with the
 * values of your form when the user submits the form
 * _and_ all validation passes. Your `onSubmit` function
 * will not be called if there are validation errors.
 *
 * ### 2. Provide a way to render the form
 *
 * There are three ways to render a `<Form/>` component:
 *
 * | Prop                | Type                  |
 * | ------------------- | --------------------- |
 * | `<Form component/>` | `React.ComponentType` |
 * | `<Form render/>`    | `Function`            |
 * | `<Form children/>`  | `Function`            |
 *
 * The only important distinction is that if you pass a
 * `component` prop, it will be rendered with
 * [`React.createElement()`](https://reactjs.org/docs/react-api.html#createelement),
 * resulting in your component actually being in the
 * React node tree, i.e. inspectable in [DevTools](https://github.com/facebook/react-devtools#react-developer-tools-).
 *
 * While using `component` might feel easiest if you are
 * migrating from [Redux Form's Higher Order Component](https://redux-form.com/8.2.2/docs/api/reduxform.md/)
 * model, best practice recommends using a render prop.
 *
 * ### 3. Do something with `handleSubmit`
 *
 * The most important thing that `<Form/>` will pass to
 * your render function is the `handleSubmit` function.
 * `handleSubmit` is a convenience method designed to be
 * passed as the `onSubmit` prop to an HTML `<form>`
 * component. `handleSubmit` will call `event. preventDefault()`
 * to stop the default browser submission process.
 *
 * In practice, your form will always look something like
 * this:
 *
 * <!-- prettier-ignore -->
 * ```tsx
 * <Form onSubmit={onSubmit}>
 *   {props => (
 *     <form onSubmit={props.handleSubmit}>
 *
 *       ... fields go here...
 *
 *       <button type="submit">Submit</button>
 *     </form>
 *   )}
 * </Form>
 * ```
 */
function ReactFinalForm<
  FormValues extends FormValuesShape = FormValuesShape,
  Subscription extends FormSubscription = FullFormSubscription,
>(props: Props<FormValues, Subscription>) {
  const {
    debug,
    decorators = [],
    destroyOnUnregister,
    form: alternateFormApi,
    initialStatus,
    initialValues,
    initialValuesEqual,
    keepDirtyOnReinitialize,
    mutators,
    onSubmit,
    subscription = all as Subscription,
    validate,
    validateOnBlur,
    ...rest
  } = props;

  const config: Config<FormValues> = {
    debug,
    destroyOnUnregister,
    initialStatus,
    initialValues,
    keepDirtyOnReinitialize,
    mutators,
    onSubmit,
    validate,
    validateOnBlur,
  };

  const form: FormApi<FormValues> = useConstant(() => {
    const f = alternateFormApi || createForm(config);

    // pause validation until children register all fields on first render (unpaused in useEffect() below)
    f.pauseValidation();

    return f;
  });

  /** The `FieldState` based on the passed in `subscription`. */
  type SubscribedState = FormStateBasedOnSubscription<FormValues, Subscription>;

  // synchronously register and unregister to query form state for our subscription on first render
  const [state, setState] = React.useState<SubscribedState>(
    (): SubscribedState => {
      let initialState = {} as SubscribedState;

      form.subscribe<Subscription>((formState) => {
        initialState = formState;
      }, subscription as Subscription)();

      return initialState;
    },
  );

  // save a copy of state that can break through the closure
  // on the shallowEqual() line below.
  const stateRef = React.useRef<SubscribedState>(state);
  stateRef.current = state;

  React.useEffect(() => {
    // We have rendered, so all fields are now registered, so we can unpause validation
    form.isValidationPaused() && form.resumeValidation();

    const unsubscriptions: Unsubscribe[] = [
      form.subscribe<Subscription>((formState) => {
        if (!shallowEqual(formState, stateRef.current)) {
          setState(formState);
        }
      }, subscription as Subscription),
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
  useWhenValueChanges(initialStatus, () => {
    form.setConfig("initialStatus", initialStatus);
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

  /** We will be rendering props `lazily` (i.e. non-subscribed items will be `undefined`.) */
  type RenderProps = FormRenderProps<FormValues, Subscription>;

  /** Note that `form` and `handleSubmit` must always be passed in. */
  type NonLazyRenderProps = Pick<RenderProps, "form" | "handleSubmit">;

  const renderProps = {
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
  } as const satisfies NonLazyRenderProps as RenderProps;

  // At this point, `renderProps` gets values from `state` and becomes LazyRenderProps
  addLazyFormState(renderProps, state);

  return React.createElement(
    ReactFinalFormContext.Provider,
    { value: form },
    renderComponent<RenderProps>(rest, renderProps, "ReactFinalForm"),
  );
}

export default ReactFinalForm;
