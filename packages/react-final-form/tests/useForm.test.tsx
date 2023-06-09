/* eslint-disable no-console */
import "@testing-library/jest-dom/extend-expect";

import { cleanup, render } from "@testing-library/react";
import React from "react";

import { useForm } from "../src/index";
import Form from "../src/ReactFinalForm";
import { ErrorBoundary, onSubmitMock } from "./testUtils";

describe("useForm", () => {
  afterEach(cleanup);

  it("should warn if not used inside a form", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const errorSpy = jest.fn();

    const MyFormConsumer = () => {
      useForm();
      return <div />;
    };

    render(
      <ErrorBoundary spy={errorSpy}>
        <MyFormConsumer />
      </ErrorBoundary>,
    );

    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0].message).toBe(
      "useForm must be used inside of a <Form> component",
    );
    // @ts-ignore
    console.error.mockRestore();
  });

  it("should warn with component name if not used inside a form", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const errorSpy = jest.fn();

    const MyFormConsumer = () => {
      useForm("MyFormConsumer");
      return <div />;
    };

    render(
      <ErrorBoundary spy={errorSpy}>
        <MyFormConsumer />
      </ErrorBoundary>,
    );

    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0].message).toBe(
      "MyFormConsumer must be used inside of a <Form> component",
    );
    // @ts-ignore
    console.error.mockRestore();
  });

  it("should produce form if used inside <Form>", () => {
    const MyFormConsumer = () => {
      const form = useForm();
      expect(form).toBeDefined();
      expect(typeof form.change).toBe("function");
      expect(typeof form.reset).toBe("function");
      return (
        <div data-testid="formCheck">{form ? "Got a form!" : "No form!"}</div>
      );
    };

    const { getByTestId } = render(
      <Form onSubmit={onSubmitMock}>{() => <MyFormConsumer />}</Form>,
    );

    expect(getByTestId("formCheck")).toHaveTextContent("Got a form!");
  });
});
