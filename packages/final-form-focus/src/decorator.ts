import {
  Decorator,
  FormApi,
  FormStateBasedOnSubscription,
  FormValuesShape,
  ValidationErrors,
} from "final-form";

import defaultFindInput from "./findInput";
import getAllInputs from "./getAllInputs";
import { FindInput, GetInputs } from "./types";

type DecoratorSubscription = { errors: true; submitErrors: true };

const noop = () => {};

/**
 * A function that takes an optional function to collect a list of focusable inputs
 * on the page and provides a 🏁 Final Form `Decorator` that will focus on the top-most input
 * on the page with an error when a form submission fails.
 *
 * If no `getInputs` parameter is provided, it will use a generic one that will return all inputs
 * that appear in `document.forms`. If no `findInput` parameter is provided, it will use a generic one
 * that matches the name attribute of the focusable input with the path in the error object.
 */
const createDecorator =
  <FormValues extends FormValuesShape = FormValuesShape>(
    getInputs?: GetInputs,
    findInput?: FindInput,
  ): Decorator<FormValues> =>
  (form: FormApi<FormValues>) => {
    const focusOnFirstError = (errors: ValidationErrors) => {
      if (!getInputs) {
        getInputs = getAllInputs;
      }
      if (!findInput) {
        findInput = defaultFindInput;
      }
      const firstInput = findInput(getInputs(), errors);
      if (firstInput) {
        firstInput.focus();
      }
    };
    // Save original submit function
    const originalSubmit = form.submit;

    // Subscribe to errors, and keep a local copy of them
    let state = {} as FormStateBasedOnSubscription<
      FormValues,
      DecoratorSubscription
    >;

    const unsubscribe = form.subscribe<DecoratorSubscription>(
      (nextState) => {
        state = nextState;
      },
      { errors: true, submitErrors: true },
    );

    // What to do after submit
    const afterSubmit = () => {
      const { errors, submitErrors } = state;

      if (errors && Object.keys(errors).length) {
        focusOnFirstError(errors);
      } else if (submitErrors && Object.keys(submitErrors).length) {
        focusOnFirstError(submitErrors);
      }
    };

    // Rewrite submit function
    form.submit = () => {
      const result = originalSubmit.call(form);
      if (result && typeof result.then === "function") {
        // async
        result.then(afterSubmit, noop);
      } else {
        // sync
        afterSubmit();
      }
      return result;
    };

    return () => {
      unsubscribe();

      form.submit = originalSubmit;
    };
  };

export default createDecorator;
