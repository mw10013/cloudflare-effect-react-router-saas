import { unstable_createContext } from "react-router";
import type { AppLoadContext } from "react-router";
// import type { createAuth } from "./auth";

export const appLoadContext = unstable_createContext<AppLoadContext>();
