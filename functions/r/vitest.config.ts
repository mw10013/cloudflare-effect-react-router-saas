import { cloudflare } from "@cloudflare/vite-plugin";
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineWorkersConfig({
  plugins: [
    // cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    // reactRouter(),
    tsconfigPaths(),
  ],
  test: {
    globals: true,
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.jsonc" },
      },
    },
  },
});
