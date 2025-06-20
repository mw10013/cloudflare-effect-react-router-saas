import type { Route } from "./+types/signout";
import { Effect } from "effect";
import { redirect } from "react-router";
import * as ReactRouter from "~/lib/ReactRouter";

export const action = ReactRouter.routeEffect(({ context }: Route.ActionArgs) =>
  Effect.gen(function* () {
    const appLoadContext = yield* ReactRouter.AppLoadContext;
    context.set(ReactRouter.appLoadContext, {
      ...appLoadContext,
      sessionAction: "destroy",
    });
    return redirect("/");
  }),
);
