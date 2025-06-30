import type { Route } from "./+types/agents.$agent.$name.$";
import { routeAgentRequest } from "agents";
import { Effect } from "effect";
import * as ReactRouterEx from "~/lib/ReactRouterEx";

export const loader = ReactRouterEx.routeEffect(
  ({ request, params: { agent, name } }: Route.LoaderArgs) =>
    Effect.gen(function* () {
      yield* Effect.log({ agent, name, url: request.url });
      const {
        cloudflare: { env },
      } = yield* ReactRouterEx.AppLoadContext;
      const response = yield* Effect.tryPromise(() =>
        routeAgentRequest(request, env),
      );
      return response
        ? response
        : Response.json(
            { error: `Agent ${agent}:${name} not found` },
            { status: 404 },
          );
    }),
);
