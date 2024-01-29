import { FormState } from "./types";

/**
 * An _à la carte_ list of all the possible things you can subscribe to for a
 * form. Useful for subscribing to everything.
 */
const formSubscriptionItems = [
  "active",
  "dirty",
  "dirtyFields",
  "dirtyFieldsSinceLastSubmit",
  "dirtySinceLastSubmit",
  "error",
  "errors",
  "hasSubmitErrors",
  "hasValidationErrors",
  "initialValues",
  "invalid",
  "modified",
  "modifiedSinceLastSubmit",
  "pristine",
  "status",
  "submitting",
  "submitError",
  "submitErrors",
  "submitFailed",
  "submitSucceeded",
  "touched",
  "valid",
  "validating",
  "values",
  "visited",
] as const satisfies readonly (keyof FormState)[];

export default formSubscriptionItems;
