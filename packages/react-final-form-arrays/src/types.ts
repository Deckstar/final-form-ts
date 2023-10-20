import type {
  BoundMutators,
  FieldSubscription,
  FormValuesShape,
  FullFieldSubscription,
  Mutators,
} from "final-form";
import {
  BoundArrayMutators,
  DefaultBoundArrayMutators,
} from "final-form-arrays";
import {
  FieldInputPropsBasedOnSubscription,
  FieldMetaState,
  FieldRenderProps,
  RenderableProps,
  UseFieldConfig,
} from "react-final-form";

export type { RenderableProps };

/** Drops the first item from a tuple type. */
type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never;

/** Drops the first parameter from a function type. */
type DropFirstArg<Func extends (...args: any[]) => any> = (
  ...argsWithoutFirst: DropFirst<Parameters<Func>>
) => ReturnType<Func>;

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
> = {
  [Func in keyof MutatorsAfterBinding]: DropFirstArg<
    MutatorsAfterBinding[Func]
  >;
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
  fields: {
    forEach: (iterator: (name: string, index: number) => void) => void;
    map: (iterator: (name: string, index: number) => any) => any[];
  } & FieldArrayMutators<
    FormValues,
    MutatorsAfterBinding & DefaultBoundArrayMutators<FormValues>
  > &
    Pick<
      FieldInputPropsBasedOnSubscription<FieldValue[], Subscription>,
      "name" | "value"
    > &
    Required<Pick<FieldMetaState<FieldValue[], Subscription>, "length">>;
  meta: Omit<FieldMetaState<FieldValue[], Subscription>, "length">;
};

/** The second parameter of `useFieldArray`, used to configure its behavior. */
export interface UseFieldArrayConfig<
  FieldValue,
  FormValues extends FormValuesShape = FormValuesShape,
  Subscription extends FieldSubscription = FullFieldSubscription,
  T extends HTMLElement = HTMLInputElement,
  RP extends FieldRenderProps<
    FieldValue[],
    FieldValue[],
    Subscription,
    T
  > = FieldRenderProps<FieldValue[], FieldValue[], Subscription, T>,
> extends Omit<
      UseFieldConfig<
        FieldValue[],
        FormValues,
        FieldValue[],
        Subscription,
        T,
        RP
      >,
      "children" | "component"
    >,
    Partial<
      Pick<
        UseFieldConfig<
          FieldValue[],
          FormValues,
          FieldValue[],
          Subscription,
          T,
          RP
        >,
        "children" | "component"
      >
    > {
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
  RP extends FieldRenderProps<
    FieldValue[],
    FieldValue[],
    Subscription,
    T
  > = FieldRenderProps<FieldValue[], FieldValue[], Subscription, T>,
> extends Omit<
      UseFieldArrayConfig<FieldValue, FormValues, Subscription, T, RP>,
      keyof RenderableProps
    >,
    RenderableProps<
      FieldArrayRenderProps<
        FieldValue,
        FormValues,
        MutatorsAfterBinding,
        Subscription
      >
    > {
  name: string;
  [otherProp: string]: any;
}
