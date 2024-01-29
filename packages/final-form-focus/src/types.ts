import { ValidationErrors } from "final-form";

/**
 * A light abstraction of any input that has a `name` property and upon which
 * `focus()` may be called.
 */
export type FocusableInput = { name: string; focus: () => void };

/** A function that collects a list of focusable inputs that exist on the page. */
export type GetInputs = () => FocusableInput[];

/**
 * A function that returns the first element in a list of focusable inputs that
 * has an error.
 */
export type FindInput = (
  inputs: FocusableInput[],
  errors?: ValidationErrors,
) => FocusableInput | null | undefined;
