import type { Route } from "./+types/authenticate";
import { Effect } from "effect";
import { redirect } from "react-router";
import * as ReactRouterEx from "~/lib/ReactRouterEx";

// /authorize taken by OpenAuth

export const loader = ReactRouterEx.routeEffect(
  ({ context }: Route.LoaderArgs) =>
    Effect.gen(function* () {
      const appLoadContext = context.get(ReactRouterEx.appLoadContext);
      if (appLoadContext.session.get("sessionUser")) {
        return redirect("/");
      }
      const { url } = yield* Effect.tryPromise(() =>
        appLoadContext.openAuth.client.authorize(
          appLoadContext.openAuth.redirectUri,
          "code",
        ),
      );
      return redirect(url);
    }),
);
