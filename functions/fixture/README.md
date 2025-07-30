# Fixture

## Fixture Structure

- `fixture` is a monorepo package that acts as the container for multiple test/demo projects.
- It provides a single `package.json` at the root, which manages all dependencies and scripts for its child projects.
- Child projects (e.g., `basics-unit-integration-self`, `basics-unit-integration-self-vite-plugin`) do not have their own `package.json`. They inherit dependencies and test/build scripts from the parent.
- Each child project contains its own source and test code, and may include custom config files (e.g., `vite.config.ts` for projects requiring special compilation).
- Tests for child projects are run from the parent context using commands like:

```
pnpm -F fixture test:ci basics-unit-integration-self
pnpm -F fixture test:ci basics-unit-integration-self-vite-plugin
```

- The parent `package.json` includes all necessary dev dependencies for Cloudflare Workers, Vite, Vitest, Wrangler, and other tools.
- This structure allows centralized dependency management and consistent test/build orchestration across all child projects.

```
pnpm -F fixture dev:vite basics-unit-integration-self-vite-plugin

pnpm -F fixture dev:wrangler basics-unit-integration-self/src/index.ts
pnpm -F fixture dev:wrangler basics-unit-integration-self-vite-plugin/src/index.ts

pnpm -F fixture exec vite dev basics-unit-integration-self
pnpm -F fixture exec vite dev basics-unit-integration-self-vite-plugin

pnpm -F fixture exec wrangler dev basics-unit-integration-self/src/index.ts
pnpm -F fixture exec wrangler dev basics-unit-integration-self-vite-plugin/src/index.ts

```

- https://github.com/cloudflare/workers-sdk/issues/9381

```
  "devDependencies": {
    "@microlabs/otel-cf-workers": "1.0.0-rc.45",
    "discord-api-types": "0.37.98",
    "ext-dep": "file:./module-resolution/vendor/ext-dep",
    "jose": "^5.2.2",
    "toucan-js": "3.4.0",
  }

```
