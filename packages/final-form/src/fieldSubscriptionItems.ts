/**
 * An _à la carte_ list of all the possible things you
 * can subscribe to for a field. Useful for subscribing
 * to everything.
 */
const fieldSubscriptionItems = [
  "active",
  "data",
  "dirty",
  "dirtySinceLastSubmit",
  "error",
  "initial",
  "invalid",
  "length",
  "modified",
  "modifiedSinceLastSubmit",
  "pristine",
  "submitError",
  "submitFailed",
  "submitSucceeded",
  "submitting",
  "touched",
  "valid",
  "value",
  "visited",
  "validating",
] as const;

export default fieldSubscriptionItems;
