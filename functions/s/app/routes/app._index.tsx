import type { Route } from "./+types/app._index";
import { redirect } from "react-router";
import { appLoadContext } from "~/lib/middleware";

export function loader({ context }: Route.LoaderArgs) {
  const { session } = context.get(appLoadContext);
  if (!session || !session.session.activeOrganizationId)
    throw new Error("Missing session or active organization");
  return redirect(`/app/${session.session.activeOrganizationId}`);
}
