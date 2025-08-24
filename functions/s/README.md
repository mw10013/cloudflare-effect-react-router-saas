
```
pnpm -F s test --project d1 auth
```

## TODO

- accept/reject invitation fetchers
- middleware for organizationId
- gridlist for invitations and members
- sign out a11y in sidebar

## Vitest

- BUG: Discrepancy in Node Module Compatibility Between wrangler deploy and vitest-pool-workers Testing : https://github.com/cloudflare/workers-sdk/issues/7324
- Critical Bug: Node.js node:os Module Import Failure in Vitest Pool Workers: https://github.com/cloudflare/workers-sdk/issues/9719
- https://developers.cloudflare.com/workers/runtime-apis/nodejs/#supported-nodejs-apis

## Better-Auth

- https://github.com/Bekacru/better-call/blob/main/src/error.ts
- resend: true is creating a duplicate invite instead of reusing the existing one: https://github.com/better-auth/better-auth/issues/3507
- Create organization on user sign-up: https://github.com/better-auth/better-auth/issues/2010
  - feat: allow create an org on signup and set active org on sign in: https://github.com/better-auth/better-auth/pull/3076
- Async operations don't work inside databaseHooks on Cloudflare Workers: https://github.com/better-auth/better-auth/issues/2841
- The inferred type of 'auth' cannot be named without a reference: https://github.com/better-auth/better-auth/issues/2123

# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Previewing the Production Build

Preview the production build locally:

```bash
npm run preview
```

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

Deployment is done using the Wrangler CLI.

To build and deploy directly to production:

```sh
npm run deploy
```

To deploy a preview URL:

```sh
npx wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
npx wrangler versions deploy
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
