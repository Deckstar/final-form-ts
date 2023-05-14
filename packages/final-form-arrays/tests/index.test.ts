import { Config, createForm } from "final-form";

import arrayMutators from "../src/index";
import { BoundArrayMutators } from "../src/index";

const onSubmit: Config["onSubmit"] = (_values, _callback) => {};

const form = createForm({
  mutators: { ...arrayMutators },
  onSubmit,
});

// Get form.mutators (default as object) and cast to Mutators
const mutators: BoundArrayMutators = form.mutators as any as BoundArrayMutators;

mutators.insert("customers", 0, { firstName: "", lastName: "" });
mutators.concat("customers", [
  { firstName: "", lastName: "" },
  { firstName: "", lastName: "" },
]);
mutators.move("customers", 0, 1);

const _customer = mutators.pop("customers");
mutators.push("customers", { firstName: "", lastName: "" });
mutators.removeBatch("customers", [0]);

const _removed = mutators.remove("customers", 0);
const _shifted = mutators.shift("customers");
mutators.swap("customers", 0, 1);
mutators.update("customers", 0, { firstName: "", lastName: "" });
mutators.unshift("customers", { firstName: "", lastName: "" });

// To get around the "Your test suite must contain at least one test." error
it("passes", () => {});
