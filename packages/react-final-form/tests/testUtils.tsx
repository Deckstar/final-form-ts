import React, { PropsWithChildren } from "react";
import { act } from "react-dom/test-utils";

export const onSubmitMock = <T extends any>(
  _values: T,
  _form: any,
  _callback?: (...args: any) => any,
) => {};

export const wrapWith =
  (
    mock: (...args: any[]) => any,
    fn: (...args: Parameters<typeof mock>) => any,
  ) =>
  (...args: Parameters<typeof mock>) => {
    mock(...args);
    return fn(...args);
  };

/** A simple container component that allows boolean to be toggled with a button */
export function Toggle({
  children,
}: {
  children: (onState: boolean) => React.ReactNode;
}) {
  const [on, setOn] = React.useState(false);
  return (
    <div>
      {children(on)}
      <button onClick={() => act(() => setOn(!on))}>Toggle</button>
    </div>
  );
}

export class ErrorBoundary extends React.Component<PropsWithChildren<any>> {
  componentDidCatch(error: any) {
    // @ts-ignore
    this.props.spy(error);
  }

  render() {
    return this.props.children;
  }
}
