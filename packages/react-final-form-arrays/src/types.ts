import type { FieldState, FormValuesShape } from "final-form";
import { Mutators } from "final-form-arrays";
import { RenderableProps, UseFieldConfig } from "react-final-form";

export type { RenderableProps };

type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never;

type DropFirstArg<Func extends (...args: any[]) => any> = (
  ...argsWithoutFirst: DropFirst<Parameters<Func>>
) => ReturnType<Func>;

export interface FieldMutator<FormValues> {
  <Key extends keyof FormValues>(name: Key, ...args: any[]): any;
  <Key extends string>(name: Key, ...args: any[]): any;
}

export type MutatorsDictionary<FormValues extends FormValuesShape> = {
  [mutator: string]: FieldMutator<FormValues>;
};

export type FieldMutators<
  FormValues extends FormValuesShape = FormValuesShape,
  Functions extends MutatorsDictionary<FormValues> = Mutators<FormValues>,
> = {
  [Func in keyof Functions]: DropFirstArg<Functions[Func]>;
};

export type FieldArrayRenderProps<
  FieldValue,
  FormValues extends FormValuesShape = FormValuesShape,
  Functions extends MutatorsDictionary<FormValues> = Mutators<FormValues>,
> = {
  fields: {
    forEach: (iterator: (name: string, index: number) => void) => void;
    length: number;
    map: (iterator: (name: string, index: number) => any) => any[];
    name: string;
    value: FieldValue[];
  } & FieldMutators<FormValues, Functions>;
  meta: Partial<FieldState<FieldValue[]>>;
};

export interface UseFieldArrayConfig<
  FieldValue,
  FormValues extends FormValuesShape = FormValuesShape,
  T extends HTMLElement = HTMLInputElement,
> extends Omit<
      UseFieldConfig<FieldValue[], FormValues, FieldValue[], T>,
      "children" | "component"
    >,
    Partial<
      Pick<
        UseFieldConfig<FieldValue[], FormValues, FieldValue[], T>,
        "children" | "component"
      >
    > {
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
