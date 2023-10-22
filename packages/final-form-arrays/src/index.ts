import type { BoundMutators, FormValuesShape } from "final-form";

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
export type { ArrayMutator, ArrayMutators, BoundArrayMutators } from "./types";
export type { Unshift, UnshiftMutator } from "./unshift";
export type { Update, UpdateMutator } from "./update";

/** The shape of the default array mutators as passed in to the final-form config. */
export type DefaultArrayMutators<
  FormValues extends FormValuesShape = FormValuesShape,
> = {
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
};

/**
 * The default mutators if we just convert each of them into a `BoundMutator`.
 *
 * Note that, because we're using interfaces, we don't just return this
 * result for `DefaultBoundArrayMutators` below. But this is still useful
 * for ensuring that our types conform.
 *
 * Conveniently, this mapping also copies over JSDoc comments.
 */
type DefaultsBound<FormValues extends FormValuesShape> = BoundMutators<
  DefaultArrayMutators<FormValues>,
  FormValues
>;

/** The shape of the default array mutators once final-form has bound them to state. */
export type DefaultBoundArrayMutators<
  FormValues extends FormValuesShape = FormValuesShape,
> = DefaultsBound<FormValues> & {
  insert: Insert<FormValues>;
  concat: Concat<FormValues>;
  move: Move<FormValues>;
  pop: Pop<FormValues>;
  push: Push<FormValues>;
  remove: Remove<FormValues>;
  removeBatch: RemoveBatch<FormValues>;
  shift: Shift<FormValues>;
  swap: Swap<FormValues>;
  update: Update<FormValues>;
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
} as const satisfies DefaultArrayMutators;

export default mutators;
