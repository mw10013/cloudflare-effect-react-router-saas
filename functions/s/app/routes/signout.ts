import type { Route } from "./+types/signout";
import { redirect } from "react-router";
import { appLoadContext } from "~/lib/middleware";

export async function action({ request, context }: Route.ActionArgs) {
  const { auth } = context.get(appLoadContext);
  const { headers } = await auth.api.signOut({
    headers: request.headers,
    returnHeaders: true,
  });
  return redirect("/", { headers });
}
