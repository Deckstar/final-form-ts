import { AnyObject } from "final-form";
import * as React from "react";

import type { RenderableProps } from "./types";

/** An optional `ref` prop for a rendered component. */
type OptionalRefProp = {
  /** An optional `ref` for this node. */
  ref?: React.ForwardedRef<React.ReactNode>;
};

type NonRenderableProps<Props extends AnyObject> = Omit<
  Props,
  keyof RenderableProps
> &
  OptionalRefProp;

/** Props that might be included in the render method. */
type LazyProps<RenderProps extends AnyObject> = Partial<
  NonRenderableProps<RenderProps>
>;

/** Props that will be included in the `render` method. */
type NonLazyProps<RenderProps extends AnyObject> =
  RenderableProps<RenderProps> & OptionalRefProp;

/**
 * Shared logic between components that use either `render` prop,
 * `children` render function, or `component` prop.
 */
function renderComponent<RenderProps extends AnyObject>(
  props: NonLazyProps<RenderProps>,
  lazyProps: LazyProps<RenderProps>,
  name: string,
): React.ReactElement<RenderProps> {
  const { render, children, component, ...rest } = props;

  /** The element returned by the function. */
  type Result = React.ReactElement<RenderProps>;

  if (component) {
    return React.createElement(
      component,
      Object.assign(lazyProps, rest, {
        children,
        render,
      }) as unknown as RenderProps,
    );
  }
  if (render) {
    return render(
      (children === undefined
        ? Object.assign(lazyProps, rest)
        : // inject children back in
          Object.assign(lazyProps, rest, {
            children,
          })) as RenderProps,
    ) as Result;
  }
  if (typeof children !== "function") {
    throw new Error(
      `Must specify either a render prop, a render function as children, or a component prop to ${name}`,
    );
  }

  return children(Object.assign(lazyProps, rest) as RenderProps) as Result;
}

export default renderComponent;
