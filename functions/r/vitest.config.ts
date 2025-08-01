import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineWorkersConfig({
  plugins: [tailwindcss(), tsconfigPaths()],
  test: {
    poolOptions: {
      main: "test/test-worker.ts",
      workers: {
        wrangler: { configPath: "./wrangler.jsonc" },
      },
    },
  },
});
