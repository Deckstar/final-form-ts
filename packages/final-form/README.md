# final-form-ts

## Introduction

> _Final Form TS_ is a subscription-based state-management library for building forms in JavaScript.

## Acknowledgements

Final Form TS is a fork of Erik Rasmussen's [Final Form](https://github.com/final-form/final-form), rewritten in TypeScript.

## Quick install

Pick the form package that you want and install it with the "@deckstar" prefix. For example:

```bash
yarn add @deckstar/final-form
```

The package is mostly compatible with the original `final-form` packages.

```ts
import { createForm } from "@deckstar/final-form"; // almost identical to the original final-form
```

### Package alias

If you wish to import packages with their original names (e.g. "final-form" rather than "@deckstar/final-form"), you must install the packages with an alias. Make sure to include the version! For example:

```bash
yarn add final-form@npm:@deckstar/final-form@^1.0.0
```

This alias would allow you to import things with the same package name as the original package. This can be useful if you don't wish to rewrite imports throughout a project.

```ts
// import { createForm } from "@deckstar/final-form"; // won't work anymore
import { createForm } from "final-form"; // works after adding the alias!
```
