import isFocusableInput from "./isFocusableInput";
import type { GetInputs } from "./types";

/**
 * A `GetInputs` generator that will narrow the list of inputs down to those
 * contained in the named form, i.e. `document.forms[formName]`.
 *
 * Generates a function to get all the inputs in a form with the specified name.
 */
const getFormInputs =
  (name: string): GetInputs =>
  () => {
    if (typeof document === "undefined") {
      return [];
    }

    // @ts-ignore
    const form = document.forms[name];

    return form && form.length
      ? Array.prototype.slice.call(form).filter(isFocusableInput)
      : []; // cast cheat to get from HTMLFormElement children to FocusableInput
  };

export default getFormInputs;
