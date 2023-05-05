import React, { PropsWithChildren } from "react";

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
export function Toggle({ children }: PropsWithChildren<any>) {
  const [on, setOn] = React.useState(false);
  return (
    <div>
      {children(on)}
      <button onClick={() => setOn(!on)}>Toggle</button>
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
