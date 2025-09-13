import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: [
          "./tsconfig.eslint.json",
          "./functions/*/tsconfig.cloudflare.json",
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
