/* eslint-disable @typescript-eslint/no-unused-vars */
import { useFormState } from "../../src";

const submittingToLabel = (submitting: boolean) => (submitting ? "Yes" : "No");

function Comp1() {
  const { submitting } = useFormState();
  return submittingToLabel(submitting);
}

// To get around the "Your test suite must contain at least one test." error
it("passes", () => {});
