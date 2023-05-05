/* eslint-disable no-console */
import { cleanup, render } from "@testing-library/react";
import React from "react";

import { Form, useFormState } from "../src/index";
import { ErrorBoundary } from "./testUtils";

describe("useField", () => {
  afterEach(cleanup);

  // Most of the functionality of useFormState is tested in FormSpy.test.js
  // This file is only for testing its use as a hook in other components

  it("should warn if not used inside a form", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const errorSpy = jest.fn();

    const MyFormStateComponent = () => {
      useFormState();
      return <div />;
    };

    render(
      <ErrorBoundary spy={errorSpy}>
        <MyFormStateComponent />
      </ErrorBoundary>,
    );

    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0].message).toBe(
      "useFormState must be used inside of a <Form> component",
    );
    // @ts-ignore
    console.error.mockRestore();
  });

  it("state should be enumerable", () => {
    const Test = () => {
      const state = useFormState();
      expect(Object.keys(state).length > 0).toBe(true);
      return <div>It worked</div>;
    };

    render(
      <Form onSubmit={() => {}}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Test />
          </form>
        )}
      </Form>,
    );
  });
});
