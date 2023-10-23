import type {
  BoundMutators,
  FieldSubscription,
  FormValuesShape,
  FullFieldSubscription,
  Mutators,
} from "final-form";
import {
  BoundArrayMutators,
  ConcatArguments,
  ConcatResult,
  DefaultBoundArrayMutators,
  InsertArguments,
  InsertResult,
  MoveArguments,
  MoveResult,
  PopArguments,
  PopResult,
  PushArguments,
  PushResult,
  RemoveArguments,
  RemoveBatchArguments,
  RemoveBatchResult,
  RemoveResult,
  ShiftArguments,
  ShiftResult,
  SwapArguments,
  SwapResult,
  UnshiftArguments,
  UnshiftResult,
  UpdateArguments,
  UpdateResult,
} from "final-form-arrays";
import {
  FieldInputPropsBasedOnSubscription,
  FieldMetaState,
  FieldProps,
  FieldRenderProps,
  RenderableProps,
  UseFieldConfig,
} from "react-final-form";

/** Drops the first item from a tuple type. */
type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never;

/** Drops the first parameter from a function type. */
type DropFirstArg<Func extends (...args: any[]) => any> = (
  ...argsWithoutFirst: DropFirst<Parameters<Func>>
) => ReturnType<Func>;

/**
 * For our own mutators, we can narrow down the types to make
 * them more accurate, based on the `FieldValue`.
 *
 * Userland mutators, unfortunately, will lose their generics.
 */
type FieldDefaultBoundArrayMutators<
  FormValues extends FormValuesShape = FormValuesShape,
  FieldValue extends any = any,
> = {
  insert: (
    ...args: DropFirst<InsertArguments<FormValues, string, FieldValue>>
  ) => InsertResult;
  concat: (
    ...args: DropFirst<ConcatArguments<FormValues, string, FieldValue[]>>
  ) => ConcatResult;
  move: (...args: DropFirst<MoveArguments>) => MoveResult;
  pop: (
    ...args: DropFirst<PopArguments>
  ) => PopResult<FormValues, string, FieldValue>;
  push: (
    ...args: DropFirst<PushArguments<FormValues, string, FieldValue>>
  ) => PushResult;
  remove: (
    ...args: DropFirst<RemoveArguments>
  ) => RemoveResult<FormValues, string, FieldValue>;
  removeBatch: (
    ...args: DropFirst<RemoveBatchArguments>
  ) => RemoveBatchResult<FormValues, string, FieldValue[]>;
  shift: (
    ...args: DropFirst<ShiftArguments>
  ) => ShiftResult<FormValues, string, FieldValue>;
  swap: (...args: DropFirst<SwapArguments>) => SwapResult;
  update: (
    ...args: DropFirst<UpdateArguments<FormValues, string, FieldValue>>
  ) => UpdateResult;
  unshift: (
    ...args: DropFirst<UnshiftArguments<FormValues, string, FieldValue>>
  ) => UnshiftResult;
} & {
  [Func in keyof DefaultBoundArrayMutators<FormValues>]: unknown;
}; // copies over the documentation comments without the overloads;

/**
 * Mutators for an array item in the field render props.
 *
 * These have the `name` argument dropped, as it is already bound by the component.
 */
export type FieldArrayMutators<
  FormValues extends FormValuesShape = FormValuesShape,
  MutatorsAfterBinding extends BoundArrayMutators<
    Mutators<FormValues>,
    FormValues
  > = DefaultBoundArrayMutators<FormValues>,
  FieldValue = any,
> = {
  [Func in keyof MutatorsAfterBinding]: Func extends keyof DefaultBoundArrayMutators
    ? MutatorsAfterBinding[Func] extends DefaultBoundArrayMutators<FormValues>[Func]
      ? FieldDefaultBoundArrayMutators<FormValues, FieldValue>[Func]
      : DropFirstArg<MutatorsAfterBinding[Func]>
    : DropFirstArg<MutatorsAfterBinding[Func]>;
};

/**
 * These are the props that `<FieldArray/>` provides to your render function or component.
 * This object is divided into a fields object that mimics an iterable (e.g. it has `map()`
 * and `forEach()` and `length`), and meta data about the field array.
 *
 * Keep in mind that the values in `meta` are dependent on you having subscribed to them
 * with the `subscription` prop.
 */
export type FieldArrayRenderProps<
  FieldValue,
  FormValues extends FormValuesShape = FormValuesShape,
  MutatorsAfterBinding extends BoundArrayMutators<
    Mutators<FormValues>,
    FormValues
  > = DefaultBoundArrayMutators<FormValues>,
  Subscription extends FieldSubscription = FullFieldSubscription,
> = {
  /**
   * An object that mimics an iterable (e.g. it has `map()` and `forEach()` and `length`),
   * and `meta` data about the field array.
   */
  fields: {
    /**
     * Iterates through all of the names of the fields in the
     * field array in bracket format,
     * e.g. `foo[0]`, `foo[1]`, `foo[2]`.
     */
    forEach: (iterator: (name: string, index: number) => void) => void;
    /**
     * Iterates through all of the names of the fields in the
     * field array in bracket format,
     * e.g. `foo[0]`, `foo[1]`, `foo[2]`,
     * and collects the results of the iterator function.
     *
     * You will use this in almost every implementation.
     */
    map: (iterator: (name: string, index: number) => any) => any[];
  } & FieldArrayMutators<
    FormValues,
    MutatorsAfterBinding & DefaultBoundArrayMutators<FormValues>,
    FieldValue
  > &
    Pick<
      FieldInputPropsBasedOnSubscription<FieldValue[], Subscription>,
      "name" | "value"
    > &
    Required<Pick<FieldMetaState<FieldValue[], Subscription>, "length">>;
} & {
  [Key in keyof Pick<FieldRenderProps, "meta">]: Omit<
    FieldMetaState<FieldValue[], Subscription>,
    "length"
  >;
};

/** The second parameter of `useFieldArray`, used to configure its behavior. */
export interface UseFieldArrayConfig<
  FieldValue,
  FormValues extends FormValuesShape = FormValuesShape,
  Subscription extends FieldSubscription = FullFieldSubscription,
  T extends HTMLElement = HTMLInputElement,
> extends Omit<
      UseFieldConfig<FieldValue[], FormValues, FieldValue[], Subscription, T>,
      "children" | "component"
    >,
    Partial<
      Pick<
        UseFieldConfig<FieldValue[], FormValues, FieldValue[], Subscription, T>,
        "children" | "component"
      >
    > {
  /**
   * A function that can be used to compare two arrays of values
   * (before and after every change) and calculate pristine/dirty checks.
   *
   * Defaults to a function that will `===` check each element of the array.
   */
  isEqual?: (a: FieldValue[], b: FieldValue[]) => boolean;
}

/**
 * These are props that you pass to `<FieldArray/>`. You must
 * provide one of the ways to render: `component`, `render`, or `children`.
 */
export interface FieldArrayProps<
  FieldValue,
  FormValues extends FormValuesShape = FormValuesShape,
  Subscription extends FieldSubscription = FullFieldSubscription,
  MutatorsAfterBinding extends BoundMutators<Mutators<FormValues>, FormValues> &
    DefaultBoundArrayMutators<FormValues> = DefaultBoundArrayMutators<FormValues>,
  T extends HTMLElement = HTMLInputElement,
> extends Omit<
      UseFieldArrayConfig<FieldValue, FormValues, Subscription, T>,
      keyof RenderableProps
    >,
    RenderableProps<
      FieldArrayRenderProps<
        FieldValue,
        FormValues,
        MutatorsAfterBinding,
        Subscription
      >
    >,
    Pick<
      FieldProps<FieldValue, FieldValue, FormValues, Subscription, T>,
      "name"
    > {
  [otherProp: string]: any;
}
