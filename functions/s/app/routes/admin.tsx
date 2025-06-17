import type { Route } from "./+types/admin";
import * as Oui from "@workspace/oui";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
} from "@workspace/ui/components/ui/sidebar";
import { Effect } from "effect";
import { Outlet, redirect } from "react-router";
import * as ReactRouter from "~/lib/ReactRouter";

export const adminMiddleware: Route.unstable_MiddlewareFunction =
  ReactRouter.middlewareEffect(({ context }) =>
    Effect.gen(function* () {
      const sessionUser = context
        .get(ReactRouter.appLoadContext)
        .session.get("sessionUser");
      if (!sessionUser) {
        return yield* Effect.fail(redirect("/authenticate"));
      }
      if (sessionUser.userType !== "staffer") {
        return yield* Effect.fail(new Response("Forbidden", { status: 403 }));
      }
    }),
  );

export const unstable_middleware = [adminMiddleware];

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
  {
    id: "Customers",
    href: "/admin/customers",
  },
  {
    id: "Stripe",
    href: "/admin/stripe",
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
