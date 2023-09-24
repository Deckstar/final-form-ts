/* eslint-env node */

/** @type {import("eslint").Linter.Config} */
const eslintConfig = {
  extends: ["plugin:prettier/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
    "jest",
    "prettier",
    "react",
    "react-hooks",
    "simple-import-sort",
  ],
  rules: {
    "@typescript-eslint/adjacent-overload-signatures": "error",
    "@typescript-eslint/no-dynamic-delete": "error",
    "@typescript-eslint/no-shadow": ["error", { hoist: "functions" }],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        args: "after-used",
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "no-console": "warn",
    "prettier/prettier": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
  },
};

module.exports = eslintConfig;
