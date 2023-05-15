/* eslint-disable @typescript-eslint/no-unused-vars */
import arrayMutators, { BoundArrayMutators } from "final-form-arrays";
import * as React from "react";
import { Field, Form } from "react-final-form";

import { FieldArray } from "../src/index";

const onSubmit = async (values: any) => {
  // eslint-disable-next-line no-console
  console.log(values);
};

type FormValues = { customers: any[] };

const basic = () => (
  <Form<FormValues>
    onSubmit={onSubmit}
    mutators={{
      ...arrayMutators,
    }}
  >
    {({
      handleSubmit,
      form: {
        mutators, // injected from final-form-arrays above
        reset,
      },
      pristine,
      submitting,
      values,
    }) => {
      const { push, pop } = mutators as BoundArrayMutators<FormValues>;

      return (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Company</label>
            <Field name="company" component="input" />
          </div>
          <div className="buttons">
            <button type="button" onClick={() => push("customers", undefined)}>
              Add Customer
            </button>
            <button type="button" onClick={() => pop("customers")}>
              Remove Customer
            </button>
          </div>
          <FieldArray name="customers">
            {({ fields }) =>
              fields.map((name, index) => (
                <div key={name}>
                  <label>Cust. #{index + 1}</label>
                  <Field
                    name={`${name}.firstName`}
                    component="input"
                    placeholder="First Name"
                  />
                  <Field
                    name={`${name}.lastName`}
                    component="input"
                    placeholder="Last Name"
                  />
                  <span
                    onClick={() => fields.remove(index)}
                    style={{ cursor: "pointer" }}
                  >
                    ❌
                  </span>
                </div>
              ))
            }
          </FieldArray>

          <div className="buttons">
            <button type="submit" disabled={submitting || pristine}>
              Submit
            </button>
            <button
              type="button"
              onClick={() => reset()}
              disabled={submitting || pristine}
            >
              Reset
            </button>
          </div>
          <pre>{JSON.stringify(values)}</pre>
        </form>
      );
    }}
  </Form>
);

// To get around the "Your test suite must contain at least one test." error
it("passes", () => {});
