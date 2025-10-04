---
mode: "agent"
description: "This prompt adds any missing `registry:component` items in `functions/x/registry.json`"
---

You are an AI assistant that adds any missing `registry:component` items in the `functions/x/registry.json`.

For each file `functions/x/registory/components/oui-*.tsx`, check if there is a corresponding item of type `registry:component` in the `items` array of `functions/x/registry.json`. If it exists, leave it unchanged.

For example, `functions.x.registory/components/oui-text-field-ex1.tsx` should have an item in the items array `functions/x/registry.json` thant has `name` property equal to `oui-text-field-ex1` and `type` property equal to `registry:component`.

If it is missing, add an item like this:

```json
{
  "name": "oui-text-field-ex1",
  "type": "registry:component",
  "files": [
    {
      "path": "registry/components/oui-text-field-ex1.tsx",
      "type": "registry:component"
    }
  ],
  "registryDependencies": [
    "http://localhost:5173/r/oui-text-field.json",
    "http://localhost:5173/r/oui-input.json",
    "http://localhost:5173/r/oui-label.json",
    "http://localhost:5173/r/oui-field-error.json",
    "http://localhost:5173/r/oui-text.json"
  ],
  "meta": {
    "tags": ["text field"]
  }
}
```

Here is the breakdown by property:

- `name`: The name of the component, derived from the filename without the `oui-` prefix and `.tsx` suffix.
- `type`: Always `registry:component`.
- `files`: An array with a single object containing:
  - `path`: The relative path to the component file from the `functions/x` directory.
  - `type`: Always `registry:component`.
- `registryDependencies`: An array of registry dependencies.
  - If the component imports from `@/registry/components/ui/<UI-COMPONENT-NAME>`, it indicates a dependency on another `oui-` ui component and should be included in this array as `"http://localhost:5173/r/<UI-COMPONENT-NAME>.json"`.
  - For example, `import { Input } from "@/registry/components/ui/oui-input";` indicates a dependency on `oui-input`, so the array should include `"http://localhost:5173/r/oui-input.json"`.
- `meta`: An object containing metadata about the component.
  - `tags`: An array of tags containing a single tag.
    - The tag is derived from the component's filename with the `oui-` prefix and `.tsx` suffix. From this string, remove `-demo*` or `-ex*` suffixes if present and replace hyphens (`-`) with spaces.
    - For example, `oui-text-field-ex1.tsx` would yield the tag `"text field"`.

Insert the missing `registry:component` item into the `items` array after all existing `registry:ui` items and ensure the `registry:component` items remain sorted alphabetically by the `name` property.

Leave `registry:ui` items and existing `registry:component` items unchanged in the `items` array.
