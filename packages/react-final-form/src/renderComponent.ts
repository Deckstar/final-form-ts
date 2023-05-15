import { AnyObject } from "final-form";
import * as React from "react";

import type { RenderableProps } from "./types";

// shared logic between components that use either render prop,
// children render function, or component prop
function renderComponent<T>(
  props: RenderableProps<T> & T,
  lazyProps: AnyObject,
  name: string,
): React.ReactElement {
  const { render, children, component, ...rest } = props;
  if (component) {
    return React.createElement(
      // @ts-ignore
      component,
      Object.assign(lazyProps, rest, {
        children,
        render,
      }),
    );
  }
  if (render) {
    return render(
      // @ts-ignore
      children === undefined
        ? Object.assign(lazyProps, rest)
        : // inject children back in
          Object.assign(lazyProps, rest, { children }),
    );
  }
  if (typeof children !== "function") {
    throw new Error(
      `Must specify either a render prop, a render function as children, or a component prop to ${name}`,
    );
  }
  // @ts-ignore
  return children(Object.assign(lazyProps, rest));
}

export default renderComponent;
