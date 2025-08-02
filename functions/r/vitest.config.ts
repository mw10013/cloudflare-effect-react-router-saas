import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['test/*/vitest.config.ts'],
  },
})

// import path from "node:path";
// import {
//   defineWorkersProject,
//   readD1Migrations,
// } from "@cloudflare/vitest-pool-workers/config";
// import tailwindcss from "@tailwindcss/vite";
// import tsconfigPaths from "vite-tsconfig-paths";

// export default defineWorkersProject(async () => {
//   const migrationsPath = path.join(__dirname, "migrations");
//   const migrations = await readD1Migrations(migrationsPath);
//   return {
//     plugins: [tailwindcss(), tsconfigPaths()],
//     test: {
//       setupFiles: ["./test/apply-migrations.ts"],
//       poolOptions: {
//         workers: {
//           main: "test/test-worker.ts",
//           isolatedStorage: false,
//           singleWorker: true,
//           wrangler: {
//             configPath: "./wrangler.jsonc",
//           },
//           miniflare: {
//             bindings: { TEST_MIGRATIONS: migrations },
//           },
//         },
//       },
//     },
//   };
// });
