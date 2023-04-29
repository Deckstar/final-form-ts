import type { FormApi } from "final-form";
import * as React from "react";

// @ts-ignore
const ReactFinalFormContext = React.createContext<FormApi<any, any>>();

export default ReactFinalFormContext;
