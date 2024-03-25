import { MutableState } from "../src";
import createForm from "../src/FinalForm";
import { onSubmitMock } from "./testUtils";

describe("FinalForm.registerField", () => {
  it("should fix up field that is created by mutators", () => {
    type FormValues = { foo: string };

    const form = createForm<FormValues>({
      onSubmit: onSubmitMock,
      initialValues: {
        foo: "bar",
      },
      mutators: {
        setFieldState: (args: any, state: MutableState<FormValues>) => {
          state.fields.foo = {
            active: false,
            // @ts-ignore
            afterSubmit: undefined,
            beforeSubmit: undefined,
            data: {} as FormValues,
            isEqual: (a: any, b: any) => a === b,
            lastFieldState: undefined,
            modified: true,
            modifiedSinceLastSubmit: false,
            name: "foo",
            touched: true,
            valid: true,
            validateFields: undefined,
            validators: {},
            validating: false,
            visited: true,
          };
        },
      },
    });

    form.mutators.setFieldState();

    const spy = jest.fn();

    form.registerField("foo", spy, { value: true });
    expect(typeof spy.mock.calls[0][0].blur).toBe("function");
    expect(typeof spy.mock.calls[0][0].focus).toBe("function");
    expect(typeof spy.mock.calls[0][0].change).toBe("function");
  });

  it("should handle non-prototype fields correctly", () => {
    const submitSpy = jest.fn();
    const changeSpy = jest.fn();

    const form = createForm({ onSubmit: submitSpy });
    form.registerField("constructor", changeSpy);

    expect(changeSpy).toHaveBeenCalledTimes(1);
    form.change("constructor", "bar");
    form.submit();
    expect(submitSpy).toHaveBeenCalledTimes(1);
  });
});
