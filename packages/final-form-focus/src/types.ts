import { ValidationErrors } from "final-form";

export type FocusableInput = { name: string; focus: () => void };

export type GetInputs = () => FocusableInput[];

export type FindInput = (
  inputs: FocusableInput[],
  errors?: ValidationErrors,
) => FocusableInput | null | undefined;
