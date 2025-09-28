# o

- oui-demo

## Local Dev

- pnpm i
- pnpm -F <PACKAGE_NAME> dev

## Deploy

- pnpm -F <PACKAGE_NAME> deploy:PRODUCTION
- Workers & Pages Settings: <WRANGLER_NAME>-production
  - Git repository: connect to git repo
  - Build configuration
    - Build command: CLOUDFLARE_ENV=production pnpm -F <PACKAGE_NAME> build
    - Deploy command: pnpm -F <PACKAGE_NAME> exec wrangler deploy
  - Build watch paths
    - Include paths: functions/<PACKAGE_NAME>/\* functions/oui/\*

## Shadcn

- pnpm -F <PACKAGE_NAME> exec shadcn add button
- components.json

  - aliases currently point to @workspace/ui and may want to alias components, utils, and hooks to local

  ## Design

  - https://weberdominik.com/blog/rules-user-interfaces/

  ## Registry

```
#fetch https://ui.shadcn.com/docs/registry/getting-started
#fetch https://ui.shadcn.com/docs/registry/registry-json
#fetch https://ui.shadcn.com/schema/registry.json
#fetch https://ui.shadcn.com/schema/registry-item.json
#fetch https://ui.shadcn.com/r

pnpm -F o exec shadcn help
pnpm -F o exec shadcn help build
pnpm -F o registry:build
```

### Registry Plan

## Step-by-Step Plan to Add Shadcn Registry to `functions/o`

### 1. Understand the Structure

- UI components are located in `functions/oui/src/` (shared library).
- `functions/o` is the demo application that bundles `functions/oui`.
- The registry will allow users to install components from `oui` into their projects using `shadcn add`.

### 2. Create `registry.json` in `functions/o`

- Location: `functions/o/public/registry.json` (in the `public` directory, as it's a static asset served by Cloudflare Pages at `/registry.json`).
- This file defines the registry metadata and lists all items (components).
- Schema: Follow `https://ui.shadcn.com/schema/registry.json`.
- Since using Cloudflare Vite plugin, static assets in `public/` are automatically served without additional configuration.
- Example structure:
  ```json
  {
    "$schema": "https://ui.shadcn.com/schema/registry.json",
    "name": "oui",
    "homepage": "https://your-homepage.com",
    "items": [
      // List of components from oui
    ]
  }
  ```
- The `shadcn build` command will use this as the source and generate individual JSON files in `public/r/` (e.g., `public/r/button.json`), which are also static assets served at `/r/button.json`.

### 3. Define Registry Items

- For each component in `functions/oui/src/` (e.g., `oui-button.tsx`), create an item in `items` array.
- Each item requires:
  - `name`: e.g., "button"
  - `type`: "registry:component" or "registry:ui"
  - `title`: Human-readable title
  - `description`: Brief description
  - `files`: Array of files, each with `path` (relative to `functions/o` root, e.g., "../oui/src/oui-button.tsx") and `type` ("registry:component")
  - `registryDependencies`: Other oui components it depends on
  - `dependencies`: NPM packages required
- Manually list all components from `oui-index.ts` or scan the src folder.

### 4. Add Build Script

- In `functions/o/package.json`, add:
  ```json
  "scripts": {
    "registry:build": "shadcn build"
  }
  ```
- Ensure `shadcn` is installed: `pnpm add shadcn@canary` (if not already).

### 5. Build the Registry

- Run `pnpm -F o registry:build`
- This generates JSON files in `functions/o/public/r/` (e.g., `public/r/button.json`).
- Each JSON contains the component's metadata and file contents.

### 6. Serve the Registry

- Since `functions/o` is a Cloudflare Pages app, the registry is served at `https://your-domain.com/r/[component].json`.
- In local dev: `pnpm -F o dev` serves at `http://localhost:port/r/button.json`.

### 7. Test Installation

- From another project, test: `npx shadcn@latest add https://localhost:port/r/button.json`
- Ensure components install correctly with dependencies.

### 8. Publish and Deploy

- Deploy `functions/o` to Cloudflare Pages.
- Update `homepage` in `registry.json` to the live URL.
- Users can now add from `https://your-live-url.com/r/[component].json`.

### Notes

- Paths in `files` must be relative to `functions/o` root.
- Since `oui` is bundled, ensure build process includes the components.
- Follow guidelines: Use `registry/[style]/[name]` structure if organizing locally, but since components are in `oui`, reference via relative paths.
- Rebuild registry after adding new components to `oui`.
