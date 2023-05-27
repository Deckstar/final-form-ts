import type { FormValuesShape } from "final-form";

import concat, { Concat, ConcatMutator } from "./concat";
import insert, { Insert, InsertMutator } from "./insert";
import move, { Move, MoveMutator } from "./move";
import pop, { Pop, PopMutator } from "./pop";
import push, { Push, PushMutator } from "./push";
import remove, { Remove, RemoveMutator } from "./remove";
import removeBatch, { RemoveBatch, RemoveBatchMutator } from "./removeBatch";
import shift, { Shift, ShiftMutator } from "./shift";
import swap, { Swap, SwapMutator } from "./swap";
import unshift, { Unshift, UnshiftMutator } from "./unshift";
import update, { Update, UpdateMutator } from "./update";

export type { Concat, ConcatMutator } from "./concat";
export type { Insert, InsertMutator } from "./insert";
export type { Move, MoveMutator } from "./move";
export type { Pop, PopMutator } from "./pop";
export type { Push, PushMutator } from "./push";
export type { Remove, RemoveMutator } from "./remove";
export type { RemoveBatch, RemoveBatchMutator } from "./removeBatch";
export type { Shift, ShiftMutator } from "./shift";
export type { Swap, SwapMutator } from "./swap";
export type { Unshift, UnshiftMutator } from "./unshift";
export type { Update, UpdateMutator } from "./update";

/** The shape of the mutators as passed in to the final-form config. */
export interface ArrayMutators<
  FormValues extends FormValuesShape = FormValuesShape,
> {
  /** Inserts a value into the specified index of the field array. */
  insert: InsertMutator<FormValues>;
  /** Concatenates an array at the end of the field array. */
  concat: ConcatMutator<FormValues>;
  /** Moves a value from one index to another index in the field array. */
  move: MoveMutator<FormValues>;
  /** Pops a value off the end of an field array. Returns the value. */
  pop: PopMutator<FormValues>;
  /** Pushes a value onto the end of an field array. */
  push: PushMutator<FormValues>;
  /** Removes a value from the specified index of the field array. Returns the removed value. */
  remove: RemoveMutator<FormValues>;
  /** Removes the values at the specified indexes of the field array. */
  removeBatch: RemoveBatchMutator<FormValues>;
  /** Removes a value from the beginning of the field array. Returns the value. */
  shift: ShiftMutator<FormValues>;
  /** Swaps the position of two values in the field array. */
  swap: SwapMutator<FormValues>;
  /** Updates a value of the specified index of the field array. */
  update: UpdateMutator<FormValues>;
  /** Inserts a value onto the beginning of the field array. */
  unshift: UnshiftMutator<FormValues>;
}

/** The shape of the mutators once final-form has bound them to state. */
export type BoundArrayMutators<
  FormValues extends FormValuesShape = FormValuesShape,
> = {
  /** Inserts a value into the specified index of the field array. */
  insert: Insert<FormValues>;
  /** Concatenates an array at the end of the field array. */
  concat: Concat<FormValues>;
  /** Moves a value from one index to another index in the field array. */
  move: Move<FormValues>;
  /** Pops a value off the end of an field array. Returns the value. */
  pop: Pop<FormValues>;
  /** Pushes a value onto the end of an field array. */
  push: Push<FormValues>;
  /** Removes a value from the specified index of the field array. Returns the removed value. */
  remove: Remove<FormValues>;
  /** Removes the values at the specified indexes of the field array. */
  removeBatch: RemoveBatch<FormValues>;
  /** Removes a value from the beginning of the field array. Returns the value. */
  shift: Shift<FormValues>;
  /** Swaps the position of two values in the field array. */
  swap: Swap<FormValues>;
  /** Updates a value of the specified index of the field array. */
  update: Update<FormValues>;
  /** Inserts a value onto the beginning of the field array. */
  unshift: Unshift<FormValues>;
};

const mutators = {
  insert,
  concat,
  move,
  pop,
  push,
  remove,
  removeBatch,
  shift,
  swap,
  unshift,
  update,
} as const satisfies ArrayMutators;

export default mutators;
