import * as React from "react";

import type { RenderableProps } from "./types";

// shared logic between components that use either render prop,
// children render function, or component prop
function renderComponent<Props>(
  props: RenderableProps<Props> & Props,
  name: string,
): React.ReactElement {
  const { render, children, component, ...rest } = props;

  if (component) {
    // @ts-expect-error
    return React.createElement(component, { ...rest, children, render }); // inject children back in
  }

  if (render) {
    // @ts-expect-error
    return render(children === undefined ? rest : { ...rest, children }); // inject children back in
  }

  if (typeof children !== "function") {
    throw new Error(
      `Must specify either a render prop, a render function as children, or a component prop to ${name}`,
    );
  }

  // @ts-expect-error
  return children(rest);
}

export default renderComponent;
