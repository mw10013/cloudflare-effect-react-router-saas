import type { AppLoadContext } from "react-router";
import { createRequestHandler } from "react-router";
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
    // session: Session<SessionData, FlashData>;
    // sessionAction: "commit" | "destroy";
    // accountMember?: AccountMemberWithAccount;
    // permissions: ReadonlySet<Permission>;
  }
}

export default {
  async fetch(request, env, ctx) {
    const initialContext = new Map([
      [
        appLoadContext,
        {
          cloudflare: { env, ctx },
          auth: createAuth({
            d1: env.D1,
          }),
          // runtime,
          // session: undefined as unknown as Session<SessionData, FlashData>, // middleware populates
          // sessionAction: "commit",
          // permissions: new Set<Permission>(),
        } satisfies AppLoadContext,
      ],
    ]);
    const requestHandler = createRequestHandler(
      () => import("virtual:react-router/server-build"),
      import.meta.env.MODE,
    );

    return requestHandler(request, initialContext);
  },
} satisfies ExportedHandler<Env>;
