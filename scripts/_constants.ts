export type Package =
  | "final-form"
  | "final-form-arrays"
  | "final-form-focus"
  | "react-final-form"
  | "react-final-form-arrays";

export type ModuleKind = (typeof DIST_FOLDERS)[number];

/**
 * The list of packages in our app.
 */
export const PACKAGES = [
  "final-form",
  "final-form-arrays",
  "final-form-focus",
  "react-final-form",
  "react-final-form-arrays",
] as const;

export type Packages = typeof PACKAGES;

/**
 * Our folders, resulting as the output of TypeScript compilation.
 */
export const DIST_FOLDERS = ["cjs", "esm"] as const;

/**
 * Where TS outputs the compiled packages.
 */
export const TS_OUTPUT_DIR = `${__dirname}/../dist` as `${string}/../dist`;

/**
 * The folder in which we keep our published packages.
 */
export const DESTINATION =
  `${__dirname}/../packages` as `${string}/../packages`;
