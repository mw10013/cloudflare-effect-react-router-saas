import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["functions/s-/", "functions/shared/", "functions/ui/", "**/.wrangler/"]),
  {
    files: ["**/*.ts"],
    plugins: {
      js,
    },
    extends: ["js/recommended"],
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
    },
  },
]);

// AI: For reference
// import eslint from "@eslint/js";
// import tseslint from "typescript-eslint";

// export default tseslint.config(
//   eslint.configs.recommended,
//   ...tseslint.configs.recommendedTypeChecked,
//   {
//     files: ["**/*.{js,ts,tsx,mjs}"],
//     languageOptions: {
//       parserOptions: {
//         project: [
//           "./tsconfig.eslint.json",
//           "./functions/**/tsconfig.json",
//           "./functions/**/tsconfig.cloudflare.json",
//         ],
//         tsconfigRootDir: import.meta.dirname,
//       },
//     },
//   },
//   {
//     files: ["**/*.config.*"],
//     extends: [tseslint.configs.disableTypeChecked],
//   },
// );
