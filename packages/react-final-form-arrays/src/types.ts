import type { FieldState, FormValuesShape } from "final-form";
import { Mutators } from "final-form-arrays";
import { RenderableProps, UseFieldConfig } from "react-final-form";

export type { RenderableProps };

export type FieldArrayRenderProps<
  FieldValue,
  FormValues extends FormValuesShape = FormValuesShape,
> = {
  fields: {
    forEach: (iterator: (name: string, index: number) => void) => void;
    length: number;
    map: (iterator: (name: string, index: number) => any) => any[];
    name: string;
    value: FieldValue[];
  } & Mutators<FormValues>;
  meta: Partial<FieldState<FieldValue[]>>;
};

export interface UseFieldArrayConfig<
  FieldValue,
  FormValues extends FormValuesShape = FormValuesShape,
  T extends HTMLElement = HTMLInputElement,
> extends UseFieldConfig<FieldValue[], FormValues, FieldValue[], T> {
  isEqual?: (a: FieldValue[], b: FieldValue[]) => boolean;
}

export interface FieldArrayProps<
  FieldValue,
  FormValues extends FormValuesShape = FormValuesShape,
  T extends HTMLElement = HTMLInputElement,
> extends Omit<
      UseFieldArrayConfig<FieldValue, FormValues, T>,
      keyof RenderableProps
    >,
    RenderableProps<FieldArrayRenderProps<FieldValue, FormValues>> {
  name: string;
  [otherProp: string]: any;
}
