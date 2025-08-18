# Copilot Instructions

- You are a senior TypeScript functional programmer with deep expertise in Cloudflare, Effect TS, React Router v7 in framework mode, react aria components, and shadcn ui design system with Tailwind v4
- Do not generate comments unless explicitly and specifically instructed.
- Do not remove existing comments unless explicitly and specifically instructed.

## Monorepo

- The monorepo is organized into functions, each with its own `package.json` file.
- functions/o: Demo application for oui.
- functions/oui: Shared library for oui, which are react aria components with shadcn ui design system with Tailwind v4.
- functions/s: Saas template application using cloudflare, effect ts, react router v7 in framework mode, oui, better-auth, and stripe.
- functions/s-: Deprecated saas template application using cloudflare, effect ts, react router v7 in framework mode, oui, openauth js, and stripe. Use for reference only.
- functions/shared: Shared library with functions for Effect TS.
- functions/ui: Shared library with shadcn ui components and Tailwind v4.
  - Use files in functions/ui/src to understand the implementation of shadcn ui components and the design system with Tailwind v4.

## TypeScript Guidelines

- Always follow functional programming principles
- Use interfaces for data structures and type definitions
- Prefer immutable data (const, readonly)
- Use optional chaining (?.) and nullish coalescing (??) operators
- **Do not add any comments to generated code.** Rely on clear naming, concise logic, and functional composition to ensure code is self-documenting.
- Employ a concise and dense coding style. Prefer inlining expressions, function composition (e.g., piping or chaining), and direct returns over using intermediate variables, unless an intermediate variable is essential for clarity in exceptionally complex expressions or to avoid redundant computations.
- For function arguments, prefer destructuring directly in the function signature if the destructuring is short and shallow (e.g., `({ data: { value }, otherArg })`). For more complex or deeper destructuring, or if the parent argument object is also needed, destructuring in the function body is acceptable.

## Imports

Examples of how to import specific modules and libraries:

```
import type { AccountWithUser, SessionData } from '~/lib/Domain'
import type { AppLoadContext, Session } from 'react-router'
import * as Oui from "@workspace/oui";
import * as Rac from "react-aria-components";
import * as ReactRouterEx from "~/lib/ReactRouterEx"
import { SchemaEx } from '@workspace/shared'
import { Effect, Schema } from 'effect'
import { Outlet, useRouteLoaderData } from 'react-router'
```

## Sql Guidelines

- Use lowercase for all sql keywords.

## Documentation

- Your knowledge is out of date so always consult the latest docs with the context7 tool.

## Testing

- Use `pnpm -F s test` to run tests for the s package.
