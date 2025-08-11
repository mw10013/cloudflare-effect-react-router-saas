import type { AppLoadContext } from "react-router";
import * as Hono from "hono";
import {
  createRequestHandler,
  unstable_RouterContextProvider,
} from "react-router";
import { createAuth } from "~/lib/auth";
import { appLoadContext } from "~/lib/middleware";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
    auth: ReturnType<typeof createAuth>;
    // runtime: ReturnType<typeof makeRuntime>;
  }
}

export default {
  async fetch(request, env, ctx) {
    const hono = new Hono.Hono();
    const auth = createAuth({
      d1: env.D1,
    });
    hono.all("/api/auth/*", (c) => {
      return auth.handler(c.req.raw);
    });
    hono.all("*", (c) => {
      const context = new unstable_RouterContextProvider();
      context.set(appLoadContext, {
        cloudflare: { env, ctx },
        auth: createAuth({
          d1: env.D1,
        }),
        // runtime,
      });
      const requestHandler = createRequestHandler(
        () => import("virtual:react-router/server-build"),
        import.meta.env.MODE,
      );
      return requestHandler(c.req.raw, context as any);
    });
    const response = await hono.fetch(request, env, ctx);
    // ctx.waitUntil(runtime.dispose());
    return response;
  },
} satisfies ExportedHandler<Env>;
