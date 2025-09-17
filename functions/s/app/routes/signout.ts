import type { Route } from "./+types/signout";
import { redirect } from "react-router";
import { requestContextKey } from "~/lib/request-context";

export async function action({ request, context }: Route.ActionArgs) {
  const requestContext = context.get(requestContextKey);
  const { auth } = requestContext!;
  const { headers } = await auth.api.signOut({
    headers: request.headers,
    returnHeaders: true,
  });
  return redirect("/", { headers });
}
