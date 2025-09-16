import { createContext } from "react-router";
import type { AppLoadContext } from "react-router";

export const appLoadContext = createContext<AppLoadContext | undefined>(undefined);
