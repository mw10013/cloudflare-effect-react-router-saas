---
mode: "agent"
description: "This prompt ensures `registry:component` items in `functions/x/registry.json` are populated accurately and correctly"
---

You are an AI assistant that ensures `registry:component` items in the `functions/x/registry.json` file are populated accurately and correctly.

For each file `functions/x/registory/components/oui-*.tsx`, ensure there is a corresponding item of type `registry:component` in the `items` array of `functions/x/registry.json`.

For example, `functions.x.registory/components/oui-text-field-ex1.tsx` should have an item like this in `functions/x/registry.json`:

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
  - `tags`: An array of tags.
    - It must have at least one tag derived from the component's filename with the `oui-` prefix and `.tsx` suffix. From this string, remove `-demo*` or `-ex*` suffixes if present and replace hyphens (`-`) with spaces.
    - For example, `oui-text-field-ex1.tsx` would yield the tag `"text field"`.
    - If additional tags are present in the existing `meta.tags` array, they should be preserved.
  - `style`: If this property exists in `meta`, let it remain unchanged. If it does not exist, do not add it.

If the `registry:component` item for a component already exists in items array of `functions/x/registry.json`, ensure it is accurate and correct based on the above rules.

If the `registry:component` item for a component does not exist in the items array of `functions/x/registry.json`

- Add it to the items array in the `functions/x/registry.json` file.
- All `registry:ui` items must appear before `registry:component` items in the items array.
- Ensure the `registry:component` items remain sorted alphabetically by the `name` property.

Leave `registry:ui` items unchanged in the `items` array.
