# cloudflare-effect-react-router

- commit with effect and d1 read replica
```
git checkout f367c28d7f41b22676fe98f0d486a345cb969fdb
git checkout main
```

## Prettier

- pnpm add -D --save-exact prettier --workspace-root
- https://prettier.io/docs/en/ignore
  - Prettier will also follow rules specified in the ".gitignore" file if it exists in the same directory from which it is run.
- pnpm prettier . --check

## EsLint

```
pnpm eslint .
```

## Etc

- BUG: D1 local databases are not created with database_id: https://github.com/cloudflare/workers-sdk/issues/4548
- https://qouteall.fun/qouteall-blog/2025/Traps%20to%20Developers

## LLM

- https://agents.md/
- https://code.visualstudio.com/updates/v1_104#_support-for-agentsmd-files-experimental
- Support AGENTS.md in parent and sub-folders: https://github.com/microsoft/vscode/issues/266120
- boost prompt: https://gist.github.com/burkeholland/352ecf6be68fab1e0902d80a235b2ace
- https://wuu73.org/blog/aiguide1.html

