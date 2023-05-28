import type {
  BoundMutators,
  FieldMutators,
  FieldSubscription,
  FormValuesShape,
  FullFieldSubscription,
} from "final-form";
import { BoundArrayMutators } from "final-form-arrays";
import {
  FieldInputPropsBasedOnSubscription,
  FieldMetaState,
  FieldRenderProps,
  RenderableProps,
  UseFieldConfig,
} from "react-final-form";

export type { RenderableProps };

export type FieldArrayRenderProps<
  FieldValue,
  FormValues extends FormValuesShape = FormValuesShape,
  Mutators extends BoundMutators<FormValues> &
    BoundArrayMutators<FormValues> = BoundArrayMutators<FormValues>,
  Subscription extends FieldSubscription = FullFieldSubscription,
> = {
  fields: {
    forEach: (iterator: (name: string, index: number) => void) => void;
    map: (iterator: (name: string, index: number) => any) => any[];
  } & FieldMutators<FormValues, Mutators> &
    Pick<
      FieldInputPropsBasedOnSubscription<FieldValue[], Subscription>,
      "name" | "value"
    > &
    Required<Pick<FieldMetaState<FieldValue[], Subscription>, "length">>;
  meta: Omit<FieldMetaState<FieldValue[], Subscription>, "length">;
};

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

export interface FieldArrayProps<
  FieldValue,
  FormValues extends FormValuesShape = FormValuesShape,
  Subscription extends FieldSubscription = FullFieldSubscription,
  Mutators extends BoundMutators<FormValues> &
    BoundArrayMutators<FormValues> = BoundArrayMutators<FormValues>,
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
      FieldArrayRenderProps<FieldValue, FormValues, Mutators, Subscription>
    > {
  name: string;
  [otherProp: string]: any;
}
