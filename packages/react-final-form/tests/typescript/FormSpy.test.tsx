/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";

import { FormSpy } from "../../src";

function submitButtonSpy() {
  return (
    <FormSpy subscription={{ pristine: true, submitting: true, valid: true }}>
      {({ pristine, submitting, valid }) => {
        return (
          <button type="submit" disabled={submitting || pristine || !valid}>
            Submit
          </button>
        );
      }}
    </FormSpy>
  );
}

// To get around the "Your test suite must contain at least one test." error
it("Passes TypeScript compilation", () => {});
