import type { Route } from "./+types/app";
import { Outlet, redirect } from "react-router";
import { appLoadContext } from "~/lib/middleware";

const appMiddleware: Route.unstable_MiddlewareFunction = async ({
  context,
}) => {
  const { session } = context.get(appLoadContext);
  if (!session?.user) throw redirect("/login");
  if (session.user.role !== "user")
    throw new Response("Forbidden", { status: 403 });
};

export const unstable_middleware = [appMiddleware];

export default function RouteComponent() {
  return <Outlet />;
}
