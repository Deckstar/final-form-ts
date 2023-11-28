# final-form-ts

| Package                           | npm                                                                       | Original repo                                                      |
| --------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| @deckstar/final-form              | [npm ↗️](https://www.npmjs.com/package/@deckstar/final-form)              | [GitHub ↗️](https://github.com/final-form/final-form)              |
| @deckstar/final-form-arrays       | [npm ↗️](https://www.npmjs.com/package/@deckstar/final-form-arrays)       | [GitHub ↗️](https://github.com/final-form/final-form-arrays)       |
| @deckstar/final-form-focus        | [npm ↗️](https://www.npmjs.com/package/@deckstar/final-form-focus)        | [GitHub ↗️](https://github.com/final-form/final-form-focus)        |
| @deckstar/react-final-form        | [npm ↗️](https://www.npmjs.com/package/@deckstar/react-final-form)        | [GitHub ↗️](https://github.com/final-form/react-final-form)        |
| @deckstar/react-final-form-arrays | [npm ↗️](https://www.npmjs.com/package/@deckstar/react-final-form-arrays) | [GitHub ↗️](https://github.com/final-form/react-final-form-arrays) |

## Acknowledgements

Final Form TS is a fork of Erik Rasmussen's [Final Form](https://final-form.org), rewritten in TypeScript.

## Introduction

> _Final Form TS_ is a subscription-based state-management library for building forms in JavaScript.

This project is a rewrite of the original [Final Form](https://final-form.org), which was written in [Flow](https://flow.org). The goal of the rewrite was to provide a more type-safe experience for TypeScript users.

This version also includes a few other improvements, such as:

- JSDoc comments, so that documentation could be viewed in the IDE rather than on the various documentation websites;
- a `status` state property (similar to [Formik](https://formik.org/docs/api/formik#status-any)), as well as its `setStatus` setter and `initialStatus` initializer;
- and others;

Unlike the original Final Form, this project is also structured as a monorepo. You can find the source code for all the packages in the [packages folder](https://github.com/Deckstar/final-form-ts/tree/main/packages). The original packages have been git-merged into one repository, so their git history has been preserved.

## Quick install

Pick the form package that you want and install it with the "@deckstar" prefix. For example:

```bash
yarn add @deckstar/final-form
yarn add @deckstar/react-final-form
```

The package is mostly compatible with the original `final-form` packages.

```ts
import { Form } from "@deckstar/react-final-form"; // almost identical to the original react-final-form
```

### Package alias

If you wish to import packages with their original names (e.g. "final-form" rather than "@deckstar/final-form"), you must install the packages with an alias. Make sure to include the version! For example:

```bash
yarn add final-form@npm:@deckstar/final-form@^1.0.0
yarn add react-final-form@npm:@deckstar/react-final-form@^1.0.0
```

This alias would allow you to import things with the same package name as the original package. This can be useful if you don't wish to rewrite imports throughout a project.

```ts
// import { Form } from "@deckstar/react-final-form"; // won't work anymore
import { Form } from "react-final-form"; // works after adding the alias!
```
