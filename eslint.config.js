import eslint from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores([
    "functions/ui/",
    "**/.wrangler/",
    "**/worker-configuration.d.ts",
    "**/.react-router/",
  ]),

  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.js"],
        },
      },
    },
  },
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/prefer-string-starts-ends-with": [
        "error",
        { allowSingleElementEquality: "always" },
      ],
      "@typescript-eslint/prefer-regexp-exec": "off",
    },
  },
  {
    files: ["functions/o/**/*.tsx", "functions/s/**/*.tsx"],
    ...reactPlugin.configs.flat.recommended,
    ...reactPlugin.configs.flat["jsx-runtime"],
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
);
