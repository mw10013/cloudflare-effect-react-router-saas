# x

- Oui
- React Aria Components with Shadcn characteristics

## TODO

- tooltip
- registry recon component prompt: handle shadcn new-york
- registry:build: delete r/\*
- tags
- install
- code
- search
- index
- browser console.log errors
- sidebar-ex: SidebarTreeEx, SidebarTrigger?, probably not SidebarListBox

## Local Dev

- pnpm i
- pnpm -F <PACKAGE_NAME> dev

## Deploy

- pnpm -F <PACKAGE_NAME> deploy:PRODUCTION
- Workers & Pages Settings: <WRANGLER_NAME>-production
  - Git repository: connect to git repo
  - Build configuration
    - Build command: CLOUDFLARE_ENV=production pnpm -F <PACKAGE_NAME> build
    - Deploy command: pnpm -F <PACKAGE_NAME> exec wrangler deploy
  - Build watch paths
    - Include paths: functions/<PACKAGE_NAME>/\*

## Shadcn

```
pnpm -F <PACKAGE_NAME> exec shadcn add button

pnpm -F x exec shadcn --help
pnpm -F x exec shadcn help add
pnpm -F x exec shadcn add --all --yes --overwrite
pnpm -F x exec shadcn migrate radix

pnpm -F ui exec shadcn add https://www.kibo-ui.com/registry/ai.json
```

### VariantProps

May need to patch to import `VariantProps` as a type, especially `sidebar.tsx`.

```
import type { VariantProps } from "class-variance-authority";
```


## Design

- https://weberdominik.com/blog/rules-user-interfaces/

## Registry

```
#fetch https://ui.shadcn.com/docs/registry/getting-started
#fetch https://ui.shadcn.com/docs/registry/registry-json
#fetch https://ui.shadcn.com/schema/registry.json
#fetch https://ui.shadcn.com/schema/registry-item.json
#fetch https://ui.shadcn.com/r

pnpm -F x exec shadcn help
pnpm -F x exec shadcn help build
pnpm -F x registry:build
```

## React Aria Components

- Modals are Massive (block everything), Popovers are Petite (just pop up), both make Dialog Content (happy, accessible contents)
- Menus mean Motion (action), Dialogs deliver Depth (details), keep them separate and do not Nest.

## Tailwind

- **Utility Class:** A class applying a specific, predefined style rule.
- **Variant (Condition):** Controls when a utility applies (e.g., `hover:`, `md:`, `dark:`).
- **Modifier (Adjustment):** Adjusts a utility's value or behavior (e.g., `/50`, `-`, `!`).
- **Property:** The standard CSS property name targeted by utilities or used in arbitrary syntax (`[property:value]`).
- **Theme Mapping:** Maps semantic utility names (e.g., `primary`) via `@theme` (e.g., `--color-primary`) to CSS variables (e.g., `var(--primary)`) holding the actual values.

- https://nicolasgallagher.com/about-html-semantics-front-end-architecture/#component-modifiers
- https://weberdominik.com/blog/rules-user-interfaces/

