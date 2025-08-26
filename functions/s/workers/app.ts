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
    session?: ReturnType<typeof createAuth>["$Infer"]["Session"];
    organization?: ReturnType<typeof createAuth>["$Infer"]["Organization"];
    organizations?: ReturnType<typeof createAuth>["$Infer"]["Organization"][];
  }
}

export default {
  async fetch(request, env, ctx) {
    const hono = new Hono.Hono();
    const auth = createAuth({
      d1: env.D1,
    });
    hono.all("/api/auth/*", (c) => {
      // http://localhost:5173/api/auth/stripe/webhook
      console.log(`worker fetch: /api/auth/* ${c.req.raw.url}`);
      return auth.handler(c.req.raw);
    });
    hono.all("*", async (c) => {
      const auth = createAuth({
        d1: env.D1,
      });
      const context = new unstable_RouterContextProvider();
      context.set(appLoadContext, {
        cloudflare: { env, ctx },
        auth,
        session:
          (await auth.api.getSession({ headers: c.req.raw.headers })) ??
          undefined,
      });
      const requestHandler = createRequestHandler(
        () => import("virtual:react-router/server-build"),
        import.meta.env.MODE,
      );
      return requestHandler(c.req.raw, context);
    });
    const response = await hono.fetch(request, env, ctx);
    // ctx.waitUntil(runtime.dispose());
    return response;
  },
} satisfies ExportedHandler<Env>;
