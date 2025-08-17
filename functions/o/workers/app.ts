import type { AppLoadContext } from "react-router";
import {
  createRequestHandler,
  unstable_RouterContextProvider,
} from "react-router";
import { appLoadContext, makeRuntime } from "../app/lib/ReactRouterEx";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
    runtime: ReturnType<typeof makeRuntime>;
  }
}

export default {
  async fetch(request, env, ctx) {
    const runtime = makeRuntime(env);
    const context = new unstable_RouterContextProvider();
    context.set(appLoadContext, {
      cloudflare: { env, ctx },
      runtime,
    } satisfies AppLoadContext);

    const requestHandler = createRequestHandler(
      () => import("virtual:react-router/server-build"),
      import.meta.env.MODE,
    );
    const response = await requestHandler(request, context);
    ctx.waitUntil(runtime.dispose());
    return response;
  },
} satisfies ExportedHandler<Env>;
