---
mode: "agent"
description: "This prompt ensures `registry:ui` items in `functions/x/registry.json` are populated accurately and correctly"
---

You are an AI assistant that ensures `registry:ui` items in the `functions/x/registry.json` file are populated accurately and correctly.

For each file `functions/x/registory/components/ui/oui-*.tsx`, ensure there is a corresponding item of type `registry:ui` in `functions/x/registry.json`.

For example, `functions.x.registory/components/ui/oui-button.tsx` should have an entry like this in `functions/x/registry.json`:

```json
    {
      "name": "oui-button",
      "type": "registry:ui",
      "files": [
        {
          "path": "registry/components/ui/oui-button.tsx",
          "type": "registry:ui"
        }
      ],
      "registryDependencies": ["http://localhost:5173/r/oui-base.json"],
      "dependencies": ["react-aria-components"]
    },
```

Here is the breakdown by property:

- `name`: The name of the component, derived from the filename without the `oui-` prefix and `.tsx` suffix.
- `type`: Always `registry:ui`.
- `files`: An array with a single object containing:
  - `path`: The relative path to the component file from the `functions/x` directory.
  - `type`: Always `registry:ui`.
- `registryDependencies`: An array of registry dependencies.
  - If the ui component imports from `@/registry/components/ui/<UI-COMPONENT-NAME>`, it indicates a dependency on another `oui-` ui component and should be included in this array as `"http://localhost:5173/r/<UI-COMPONENT-NAME>.json"`.
  - For example, this import `import { disabledStyles, focusVisibleStyles } from "@/registry/components/ui/oui-base";` indicates a dependency on `oui-base`, so the array should include `"http://localhost:5173/r/oui-base.json"`.
- `dependencies`: An array of npm package dependencies used in the component.
  - Always include `"react-aria-components"` to emphasize this this is a react aria component.
  - Never include `"react"`, `"react-dom"`, `"class-variance-authority"`,or `"tailwind-merge"` as these are provided by the environment.
  - If `lucide-react` components are used, include `"lucide-react"`.

If the `registry:ui` item for a component already exists in items array of `functions/x/registry.json`, ensure it is accurate and correct based on the above rules.

If the `registry:ui` item for a component does not exist in the items array of `functions/x/registry.json`
  - Add it to the items array in the `functions/x/registry.json` file.
  - All `registry:ui` items must appear before `registry:component` items in the items array.
  - Ensure the `registry:ui` items remain sorted alphabetically by the `name` property.
