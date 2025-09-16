import type { Route } from "./+types/app";
import { Outlet, redirect } from "react-router";
import { appLoadContext } from "~/lib/middleware";

const appMiddleware: Route.unstable_MiddlewareFunction = ({ context }) => {
  const { session } = context.get(appLoadContext);
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  if (!session?.user) throw redirect("/login");
  if (session.user.role !== "user")
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response("Forbidden", { status: 403 });
};

export const unstable_middleware: Route.unstable_MiddlewareFunction[] = [
  appMiddleware,
];

export default function RouteComponent() {
  return <Outlet />;
}
