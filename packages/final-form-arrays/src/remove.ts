import type {
  FormValuesShape,
  Mutator,
  MutatorArguments,
  SetIn,
} from "final-form";
import { BoundMutator } from "final-form";

import copyField from "./copyField";
import { ArrayElement } from "./types";
import { escapeRegexTokens } from "./utils";

type RemoveValue<
  FormValues extends FormValuesShape = FormValuesShape,
  Key extends string = string,
> =
  | (FormValues[Key] extends any[] ? ArrayElement<FormValues[Key]> : any)
  | undefined;

/** Arguments for the `remove` mutator. */
export type RemoveArguments<Key extends string = string> = [
  name: Key,
  index: number,
];

/** Return type for the `remove` mutator. */
export type RemoveResult<
  FormValues extends FormValuesShape = FormValuesShape,
  Key extends string = string,
  Value extends any = RemoveValue<FormValues, Key>,
> = Value;

/** The bound `remove` function. */
export type Remove<FormValues extends FormValuesShape = FormValuesShape> =
  BoundMutator<
    RemoveMutator<FormValues>,
    RemoveArguments,
    RemoveResult<FormValues>,
    FormValues
  > &
    (<Key extends string>(
      ...args: RemoveArguments<Key>
    ) => RemoveResult<FormValues, Key>);

/** The unbound `remove` function. */
export type RemoveMutator<
  FormValues extends FormValuesShape = FormValuesShape,
> = Mutator<RemoveArguments, RemoveResult<FormValues>, FormValues> &
  (<Key extends string & keyof FormValues>(
    ...mutatorArgs: MutatorArguments<RemoveArguments<Key>, FormValues>
  ) => RemoveResult<FormValues, Key>);

const remove: RemoveMutator = (
  ...mutatorArgs: MutatorArguments<RemoveArguments<string>>
) => {
  const [[name, index], _state, { changeValue, getIn, setIn }] = mutatorArgs;
  let [_args, state] = mutatorArgs;

  let returnValue: any;

  changeValue(
    state,
    name,
    (array: any[] | null | undefined): any[] | null | undefined => {
      if (!array) {
        return array;
      }

      const copy = [...array];

      returnValue = copy[index];

      copy.splice(index, 1);

      return copy.length > 0 ? copy : undefined;
    },
  );

  // now we have to remove any subfields for our index,
  // and decrement all higher indexes.
  const pattern = new RegExp(`^${escapeRegexTokens(name)}\\[(\\d+)\\](.*)`);

  const newFields: typeof state.fields = {};

  Object.keys(state.fields).forEach((key) => {
    const tokens = pattern.exec(key);

    if (tokens) {
      const fieldIndex = Number(tokens[1]);

      if (fieldIndex === index) {
        // delete any submitErrors for this array item
        // if the root key of the delete index
        if (key === `${name}[${index}]`) {
          const path = `formState.submitErrors.${name}`;

          const submitErrors = getIn(state, path);

          // if has submitErrors for array
          if (Array.isArray(submitErrors)) {
            submitErrors.splice(index, 1);

            state = (setIn as unknown as SetIn<typeof state>)(
              state,
              path,
              submitErrors,
            );
          }
        }

        return;
      }

      if (fieldIndex > index) {
        // Shift all higher indices down
        const decrementedKey = `${name}[${fieldIndex - 1}]${tokens[2]}`;

        copyField(state.fields, key, newFields, decrementedKey);
        return;
      }
    }

    // Keep this field that does not match the name,
    // or has index smaller than what is being removed
    newFields[key] = state.fields[key];
  });

  state.fields = newFields;

  return returnValue;
};

export default remove;
