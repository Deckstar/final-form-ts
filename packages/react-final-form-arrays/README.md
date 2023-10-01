# final-form-ts

## Introduction

> _Final Form TS_ is a subscription-based state-management library for building forms in JavaScript.

## Acknowledgements

Final Form TS is a fork of Erik Rasmussen's [Final Form](https://github.com/final-form/react-final-form-arrays), rewritten in TypeScript.

## Quick install

Pick the form package that you want and install it with the "@deckstar" prefix. For example:

```bash
yarn add @deckstar/react-final-form-arrays
```

The package is mostly compatible with the original `final-form` packages.

```ts
import { useFieldArray } from "@deckstar/react-final-form-arrays"; // almost identical to the original react-final-form-arrays
```

### Package alias

If you wish to import packages with their original names (e.g. "react-final-form-arrays" rather than "@deckstar/react-final-form-arrays"), you must install the packages with an alias. Make sure to include the version! For example:

```bash
yarn add final-form@npm:@deckstar/react-final-form-arrays@^1.0.0
```

This alias would allow you to import things with the same package name as the original package. This can be useful if you don't wish to rewrite imports throughout a project.

```ts
// import { useFieldArray } from "@deckstar/react-final-form-arrays"; // won't work anymore
import { useFieldArray } from "react-final-form-arrays"; // works after adding the alias!
```
