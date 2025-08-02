import { createRequestHandler, type AppLoadContext } from "react-router";
import { appLoadContext } from "~/lib/middleware";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
    // runtime: ReturnType<typeof makeRuntime>;
    // openAuth: ReturnType<typeof OpenAuth.make> & {
    //   client: Client;
    //   redirectUri: string;
    // };
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
            // runtime,
            // openAuth: {
            //   ...openAuth,
            //   client: openAuthClient,
            //   redirectUri: `${origin}/callback`,
            // },
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
