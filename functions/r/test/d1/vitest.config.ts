import path from "node:path";
import {
  defineWorkersProject,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineWorkersProject(async () => {
  const migrationsPath = path.join(__dirname, "../../migrations");
  const migrations = await readD1Migrations(migrationsPath);
  /*
    jose uses conditional exports in its package.json, so Vite/Vitest may resolve the node build by default instead of the browser build.
    The alias forces resolution to the browser build for all imports, ensuring compatibility with browser APIs and environments.
    'noExternal' for 'better-auth' ensures it is bundled by Vite, so the alias is respected during module resolution.
  */
  return {
    plugins: [tsconfigPaths()],
    resolve: {
      alias: {
        // jose: new URL(
        //   "../../../../node_modules/.pnpm/jose@5.9.6/node_modules/jose/dist/browser/index.js",
        //   import.meta.url,
        // ).pathname,
        // "jose/errors": new URL(
        //   "../../../../node_modules/.pnpm/jose@5.9.6/node_modules/jose/dist/browser/util/errors.js",
        //   import.meta.url,
        // ).pathname,
      },
    },
    ssr: {
      noExternal: ["better-auth"],
    },
    test: {
      include: ["*.test.ts"],
      setupFiles: ["../apply-migrations.ts"],
      poolOptions: {
        workers: {
          main: "../test-worker.ts",
          isolatedStorage: false,
          singleWorker: true,
          wrangler: {
            configPath: "../../wrangler.jsonc",
          },
          miniflare: {
            bindings: { TEST_MIGRATIONS: migrations },
          },
        },
      },
    },
  };
});
