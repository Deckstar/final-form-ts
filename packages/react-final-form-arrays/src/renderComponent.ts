import { AnyObject } from "final-form";
import * as React from "react";
import { RenderableProps } from "react-final-form";

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
 * Shared logic between components that use either `render` prop, `children`
 * render function, or `component` prop.
 */
function renderComponent<RenderProps extends AnyObject>(
  props: NonLazyProps<RenderProps> & LazyProps<RenderProps>,
  name: string,
): React.ReactElement {
  const { render, children, component, ...rest } = props;

  /** The element returned by the function. */
  type Result = React.ReactElement<RenderProps>;

  if (component) {
    return React.createElement(component, {
      ...rest,
      children,
      render,
    } as unknown as RenderProps); // inject children back in
  }

  if (render) {
    return render(
      (children === undefined ? rest : { ...rest, children }) as RenderProps,
    ) as Result; // inject children back in
  }

  if (typeof children !== "function") {
    throw new Error(
      `Must specify either a render prop, a render function as children, or a component prop to ${name}`,
    );
  }

  return children(rest as RenderProps) as Result;
}

export default renderComponent;
