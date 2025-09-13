import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.{js,ts,tsx,mjs}"],
    languageOptions: {
      parserOptions: {
        project: [
          "./tsconfig.eslint.json",
          "./functions/**/tsconfig.json",
          "./functions/**/tsconfig.cloudflare.json",
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.config.*"],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
