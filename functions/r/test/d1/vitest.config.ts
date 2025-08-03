import path from "node:path";
import {
  defineWorkersProject,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineWorkersProject(async () => {
  const migrationsPath = path.join(__dirname, "../../migrations");
  const migrations = await readD1Migrations(migrationsPath);
  return {
    plugins: [tsconfigPaths()],
    resolve: {
      alias: {
        jose: '/Users/mw/Documents/src/cloudflare-effect-react-router-saas/node_modules/.pnpm/jose@5.9.6/node_modules/jose/dist/browser/index.js',
      },
    },
    ssr: {
      noExternal: ['better-auth'],
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
