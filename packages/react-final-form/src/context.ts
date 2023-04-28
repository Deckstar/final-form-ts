import * as React from "react";
import type { FormApi } from "final-form";

// @ts-ignore
const ReactFinalFormContext = React.createContext<FormApi<any, any>>();

export default ReactFinalFormContext;
