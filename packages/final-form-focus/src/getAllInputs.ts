import isFocusableInput from "./isFocusableInput";
import type { GetInputs } from "./types";

/**
 * Gets all the inputs inside all forms on the page
 */
const getAllInputs: GetInputs = () => {
  if (typeof document === "undefined") {
    return [];
  }

  return Array.prototype.slice
    .call(document.forms)
    .reduce(
      (accumulator, form) =>
        accumulator.concat(
          Array.prototype.slice.call(form).filter(isFocusableInput),
        ),
      [],
    );
};

export default getAllInputs;
