/* eslint-disable no-console */
import "@testing-library/jest-dom/extend-expect";

import { act, cleanup, render } from "@testing-library/react";
import arrayMutators from "final-form-arrays";
import React from "react";
import { Form } from "react-final-form";

import useFieldArray from "../src/useFieldArray";
import { ErrorBoundary, onSubmitMock } from "./testUtils";

describe("FieldArray", () => {
  afterEach(cleanup);

  // Most of the functionality of useFieldArray is tested in FieldArray.test.js
  // This file is only for testing its use as a hook in other components

  it("should warn if not used inside a form", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const errorSpy = jest.fn();

    const MyFieldComponent = () => {
      useFieldArray("name");
      return <div />;
    };

    render(
      <ErrorBoundary spy={errorSpy}>
        <MyFieldComponent />
      </ErrorBoundary>,
    );

    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0].message).toBe(
      "useFieldArray must be used inside of a <Form> component",
    );
    // @ts-ignore
    console.error.mockRestore();
  });

  it("should track field array state", () => {
    const spy = jest.fn();

    const MyFieldArray = () => {
      spy(useFieldArray("names"));
      return null;
    };

    render(
      <Form onSubmit={onSubmitMock} mutators={arrayMutators} subscription={{}}>
        {() => (
          <form>
            <MyFieldArray />
          </form>
        )}
      </Form>,
    );

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].fields.length).toBe(0);

    act(() => spy.mock.calls[0][0].fields.push("bob"));

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].fields.length).toBe(1);
  });
});
