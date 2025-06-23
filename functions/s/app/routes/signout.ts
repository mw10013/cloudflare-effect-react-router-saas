import type { Route } from "./+types/signout";
import { Effect } from "effect";
import { redirect } from "react-router";
import * as ReactRouterEx from "~/lib/ReactRouterEx";

export const action = ReactRouterEx.routeEffect(
  ({ context }: Route.ActionArgs) =>
    Effect.gen(function* () {
      const appLoadContext = yield* ReactRouterEx.AppLoadContext;
      context.set(ReactRouterEx.appLoadContext, {
        ...appLoadContext,
        sessionAction: "destroy",
      });
      return redirect("/");
    }),
);
