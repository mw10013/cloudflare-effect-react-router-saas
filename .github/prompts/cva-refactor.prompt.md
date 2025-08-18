---
mode: "agent"
description: "Refactor from tailwind-variants to class-variance-authority"
---

# Refactor from tailwind-variants to class-variance-authority

- Ensure these imports are at the top of the file

```
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
```

- Remove any imports from `tailwind-variants`
- Find any module variable that has 'Styles' suffix and is assigned to 'tv()'. Eg. 'headerStyles' -> 'headerVariants'.

  - Replaces 'Styles' with 'Variants' in the variable name and patch the rename in the rest of the file.
  - Change 'tv()' to 'cva()'
  - If there is a 'base' key in the object literal, delete the key and use it's value as the first argument to 'cva()'
  - The second argument to 'cva()' should be the remaining keys of the object literal
  - Where the module variable is used as a function call, wrap it in `twMerge()`

- Use 'functions/oui/src/oui-heading.tsx' and 'functions/oui/src/oui-button.tsx' as guides.
- Ask me any questions.
