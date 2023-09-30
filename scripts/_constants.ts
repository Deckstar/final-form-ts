/**
 * @typedef {"final-form" | "final-form-arrays" | "final-form-focus" | "react-final-form" | "react-final-form-arrays"} Package
 * @typedef {"cjs" | "esm"} ModuleKind
 */

/**
 * The list of packages in our app.
 *
 * @type {["final-form", "final-form-arrays", "final-form-focus", "react-final-form", "react-final-form-arrays"]}
 */
const PACKAGES = [
  "final-form",
  "final-form-arrays",
  "final-form-focus",
  "react-final-form",
  "react-final-form-arrays",
];

/**
 * Our folders, resulting as the output of TypeScript compilation.
 * @type {["cjs", "esm"]}
 */
const DIST_FOLDERS = ["cjs", "esm"];

/**
 * Where TS outputs the compiled packages.
 *
 * @type {`${string}/../dist`}
 */
const TS_OUTPUT_DIR = `${__dirname}/../dist`;

/**
 * The folder in which we keep our published packages.
 *
 * @type {`${string}/../packages`}
 */
const DESTINATION = `${__dirname}/../packages`;

module.exports = {
  PACKAGES,
  DIST_FOLDERS,
  TS_OUTPUT_DIR,
  DESTINATION,
};
