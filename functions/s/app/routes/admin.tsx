import type { Route } from "./+types/admin";
import { invariant } from "@epic-web/invariant";
import * as Oui from "@workspace/oui";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
} from "@workspace/ui/components/ui/sidebar";
import { Outlet, redirect } from "react-router";
import { requestContextKey } from "~/lib/request-context";

export const adminMiddleware: Route.MiddlewareFunction = ({ context }) => {
  const requestContext = context.get(requestContextKey);
  invariant(requestContext, "Missing request context.");
  const { session } = requestContext;
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  if (!session?.user) throw redirect("/login");
  if (session.user.role !== "admin")
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response("Forbidden", { status: 403 });
};

export const middleware: Route.MiddlewareFunction[] = [adminMiddleware];

const items = [
  {
    id: "SaaS",
    href: "/",
  },
  {
    id: "Admin",
    href: "/admin",
  },
  {
    id: "Users",
    href: "/admin/users",
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <Oui.SidebarTreeEx aria-label="Admin Navigation" items={items} />
      </SidebarContent>
    </Sidebar>
  );
}

export default function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <Oui.SidebarTrigger className="m-2" />
        <div className="flex flex-col gap-2 px-4">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
