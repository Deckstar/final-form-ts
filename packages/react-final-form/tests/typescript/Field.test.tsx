/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { Field, FieldRenderProps } from "../../src";

const NumberInput: React.FC<{ value?: number }> = () => null;

function FormText1({
  input,
}: FieldRenderProps<string, string, HTMLInputElement>) {
  // renders OK because of the used generic
  return <input type="text" {...input} />;
}

function FormText2({
  input,
}: FieldRenderProps<string, string, HTMLSelectElement>) {
  return <select {...input} />;
}

function FieldNumberValue() {
  return (
    <Field<number> name="numberField">
      {({ input }) => <NumberInput value={input.value} />}
    </Field>
  );
}

function FieldNumberInputValue() {
  return (
    <Field<string, number>
      name="numberField"
      parse={(value: number) => String(value)}
    >
      {({ input }) => <NumberInput value={input.value} />}
    </Field>
  );
}

// To get around the "Your test suite must contain at least one test." error
it("passes", () => {});
