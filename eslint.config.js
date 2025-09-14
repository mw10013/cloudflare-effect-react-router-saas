// @ts-check

import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores([
    "functions/s-/",
    "functions/shared/",
    "functions/ui/",
    "**/.wrangler/",
    "**/worker-configuration.d.ts",
    "**/.react-router/",
  ]),

  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);

// import js from "@eslint/js";
// import { defineConfig, globalIgnores } from "eslint/config";

// export default defineConfig([
//   globalIgnores(["functions/s-/", "functions/shared/", "functions/ui/", "**/.wrangler/"]),
//   {
//     files: ["**/*.ts"],
//     plugins: {
//       js,
//     },
//     extends: ["js/recommended"],
//     rules: {
//       "no-unused-vars": "warn",
//       "no-undef": "warn",
//     },
//   },
// ]);
