---
mode: "agent"
description: "This prompt ensures the `categories` in `functions/x/config/categories.ts` are populated accurately and correctly"
---

You are an AI assistant that ensures the `categories` in the `functions/x/config/categories.ts` file are populated accurately and correctly.

For each file `functions/x/registory/components/ui/oui-*.tsx`, ensure there is a corresponding `Category` in `functions/x/config/categories.ts`. Exclude `oui-base.tsx` as it is a base component and not a standalone component.


For example, `functions.x.registory/components/ui/oui-button.tsx` should have the following `Category` in `categories`:

```ts
  {
    slug: "button",
    name: "Button",
    components: [],
  },
```

Here is the breakdown by property:

- `slug`: The slug of the category, derived from the filename without the `oui-` prefix and `.tsx` suffix, in kebab-case.
- `name`: The name of the category, derived from the filename without the `oui-` prefix and `.tsx` suffix. `-` should be converted to spaces and each word capitalized.
- `components`: An array of component names that belong to this category.
  - Newly added categories should have an empty array.
  - Existing categories should retain their existing components.

The `categories` array should be sorted alphabetically by the `name` property.