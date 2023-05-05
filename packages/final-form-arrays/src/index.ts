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
export interface DefaultType<
  FormValues extends FormValuesShape = FormValuesShape,
  InitialFormValues = Partial<FormValues>,
> {
  insert: InsertMutator<FormValues, InitialFormValues>;
  concat: ConcatMutator<FormValues, InitialFormValues>;
  move: MoveMutator<FormValues, InitialFormValues>;
  pop: PopMutator<FormValues, InitialFormValues>;
  push: PushMutator<FormValues, InitialFormValues>;
  remove: RemoveMutator<FormValues, InitialFormValues>;
  removeBatch: RemoveBatchMutator<FormValues, InitialFormValues>;
  shift: ShiftMutator<FormValues, InitialFormValues>;
  swap: SwapMutator<FormValues, InitialFormValues>;
  update: UpdateMutator<FormValues, InitialFormValues>;
  unshift: UnshiftMutator<FormValues, InitialFormValues>;
}

/** The shape of the mutators once final-form has bound them to state. */
export type Mutators<FormValues extends FormValuesShape = FormValuesShape> = {
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
} as const satisfies DefaultType;

export default mutators;
