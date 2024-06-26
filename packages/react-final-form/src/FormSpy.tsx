import type {
  FormSubscription,
  FormValuesShape,
  FullFormSubscription,
} from "final-form";

import isSyntheticEvent from "./isSyntheticEvent";
import renderComponent from "./renderComponent";
import type {
  FormSpyPropsWithForm as Props,
  FormSpyRenderProps,
} from "./types";
import useForm from "./useForm";
import useFormState from "./useFormState";

/**
 * A component that subscribes to form state, and injects both form state and
 * the `form` instance via a render prop.
 *
 * The `<FormSpy/>` will rerender any time the form state it is subscribed to
 * changes. By default it subscribes to _all_ form state. You can control which
 * form state it subscribes to with the `subscription` prop.
 *
 * By providing an `onChange` prop, `<FormSpy/>` can also be used to execute
 * code when a particular part of form state changes.
 *
 * ## Props
 *
 * `<FormSpy/>` accepts `FormSpyProps` and will call the render function with
 * `FormSpyRenderProps`.
 *
 * The only required prop is one of `onChange`, `component`, `render`, or
 * `children`.
 *
 * ## Basic Usage
 *
 * It should be noted that `<FormSpy/>` is for very advanced use cases.
 *
 * **If you are not restricting your form state by providing a `subscription`
 * prop to `<Form/>`, you probably do not need `<FormSpy/>`!** Just use the form
 * state injected by `<Form/>`.
 *
 * You need to do _one_ of two things when using `<FormSpy/>`:
 *
 * ### 1. Provide a way to render the form state
 *
 * There are three ways to render a `<FormSpy/>` component:
 *
 * | Prop                   | Type                  |
 * | ---------------------- | --------------------- |
 * | `<FormSpy component/>` | `React.ComponentType` |
 * | `<FormSpy render/>`    | `Function`            |
 * | `<FormSpy children/>`  | `Function`            |
 *
 * The only important distinction is that if you pass a `component` prop, it
 * will be rendered with
 * [`React.createElement()`](https://reactjs.org/docs/react-api.html#createelement),
 * resulting in your component actually being in the React node tree, i.e.
 * inspectable in
 * [DevTools](https://github.com/facebook/react-devtools#react-developer-tools-).
 *
 * ```tsx
 * // Render a reset button that will be
 * // disabled when the form is pristine
 * <FormSpy subscription={{ pristine: true }}>
 *   {(props) => (
 *     <button
 *       type="button"
 *       disabled={props.pristine}
 *       onClick={() => props.form.reset()}
 *     >
 *       Reset
 *     </button>
 *   )}
 * </FormSpy>;
 * ```
 *
 * ### 2. Pass an `onChange` callback
 *
 * `<FormSpy/>` can sometimes be useful to execute code when a particular part
 * of form state changes. This is what the `onChange` callback is for.
 *
 * **If you pass `onChange`, nothing will be rendered.**
 *
 * ```tsx
 * <FormSpy
 *   subscription={{ valid: true }}
 *   onChange={(props) => {
 *     console.log("Form validity changed to", props.valid);
 *   }}
 * />;
 * ```
 */
function FormSpy<
  FormValues extends FormValuesShape = FormValuesShape,
  Subscription extends FormSubscription = FullFormSubscription,
>(props: Props<FormValues, Subscription>) {
  const { onChange, subscription, ...rest } = props;

  const reactFinalForm = useForm<FormValues>("FormSpy");
  const state = useFormState<FormValues, Subscription>({
    onChange,
    subscription,
  });

  if (onChange) {
    return null;
  }

  /**
   * We will be rendering props `lazily` (i.e. non-subscribed items will be
   * `undefined`.)
   */
  type RenderProps = FormSpyRenderProps<FormValues, Subscription>;

  /** Note that `form` must always be passed in. */
  type NonLazyRenderProps = Pick<RenderProps, "form">;

  const renderProps = {
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
  } as const satisfies NonLazyRenderProps;

  return renderComponent<RenderProps>(
    {
      ...rest,
      ...renderProps,
    },
    state,
    "FormSpy",
  );
}

export default FormSpy;
