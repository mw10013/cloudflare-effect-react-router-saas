# cloudflare-effect-react-router

## Prettier

- pnpm add -D --save-exact prettier --workspace-root
- https://prettier.io/docs/en/ignore
  - Prettier will also follow rules specified in the ".gitignore" file if it exists in the same directory from which it is run.
- pnpm prettier . --check

## Etc

- BUG: D1 local databases are not created with database_id: https://github.com/cloudflare/workers-sdk/issues/4548
