import type { Organization } from "better-auth/plugins";
import type { User } from "better-auth/types";
import type { Route } from "./+types/app.$organizationId";
import React from "react";
import { invariant } from "@epic-web/invariant";
import * as Oui from "@workspace/oui";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/ui/sidebar";
import { ChevronsUpDown, LogOut } from "lucide-react";
import * as Rac from "react-aria-components";
import { Outlet, useNavigate } from "react-router";
import { appLoadContext } from "~/lib/middleware";

const middleware: Route.unstable_MiddlewareFunction = async ({
  request,
  context,
  params: { organizationId },
}) => {
  const alc = context.get(appLoadContext);
  const organizations = await alc.auth.api.listOrganizations({
    headers: request.headers,
  });
  const organization = organizations.find((org) => org.id === organizationId);
  if (!organization) throw new Response("Forbidden", { status: 403 });
  context.set(appLoadContext, { ...alc, organization, organizations });
};

export const unstable_middleware = [middleware];

export async function loader({
  context,
  params: { organizationId },
}: Route.ActionArgs) {
  const { organization, organizations, session } = context.get(appLoadContext);
  invariant(organization, "Missing organization");
  invariant(organization.id === organizationId, "Organization ID mismatch");
  invariant(organizations, "Missing organizations");
  invariant(session, "Missing session");
  return {
    organization,
    organizations,
    user: session.user,
  };
}

/**
 * The `<main>` element uses `h-svh` for a stable height, essential for this app shell layout.
 * `h-dvh` is avoided because it causes jarring content reflows on mobile when browser UI resizes,
 * which is unsuitable for a layout with internal-only scrolling.
 */
export default function RouteComponent({
  loaderData: { organization, organizations, user },
}: Route.ComponentProps) {
  return (
    <SidebarProvider>
      <AppSidebar
        organization={organization}
        organizations={organizations}
        user={user}
      />
      <main className="flex h-svh w-full flex-col">
        <SidebarTrigger />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

export function AppSidebar({
  organization,
  organizations,
  user,
}: {
  organization: Organization;
  organizations: Organization[];
  user: User;
}) {
  const items = [
    {
      id: "Organization Home",
      href: `/app/${organization.id}`,
    },
    {
      id: "Members",
      href: `/app/${organization.id}/members`,
    },
    {
      id: "Invitations",
      href: `/app/${organization.id}/invitations`,
    },
    {
      id: "Billing",
      href: `/app/${organization.id}/billing`,
    },
  ];

  const AppLogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" {...props}>
      <circle cx="50" cy="50" r="40" fill="currentColor" />
    </svg>
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex w-full items-center gap-2 p-2">
          <Rac.Link href="/" aria-label="Home">
            <AppLogoIcon className="text-primary size-7" />
          </Rac.Link>
          <OrganizationSwitcher
            organizations={organizations}
            organization={organization}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Oui.SidebarTreeEx aria-label="Organization Navigation" items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

export function OrganizationSwitcher({
  organizations,
  organization,
}: {
  organizations: Organization[];
  organization: Organization;
}) {
  const navigate = useNavigate();
  return (
    <Oui.MenuEx
      className="min-w-56 rounded-lg"
      onAction={(key: React.Key) => {
        navigate(`/app/${key}`);
      }}
      triggerElement={
        <Oui.Button
          variant="ghost"
          className="h-auto flex-1 items-center justify-between p-0 text-left font-medium data-[hovered]:bg-transparent"
        >
          <div className="grid leading-tight">
            <span className="truncate font-medium">{organization.name}</span>
          </div>
          <ChevronsUpDown className="text-muted-foreground ml-2 size-4" />
        </Oui.Button>
      }
    >
      <Rac.MenuSection>
        <Oui.Header>Switch Organization</Oui.Header>
        {organizations.map((org) => (
          <Oui.MenuItem
            key={org.id}
            id={org.id}
            textValue={org.name}
            className="p-2"
          >
            {org.name}
          </Oui.MenuItem>
        ))}
      </Rac.MenuSection>
    </Oui.MenuEx>
  );
}

export function NavUser({
  user,
}: {
  user: {
    email: string;
  };
}) {
  return (
    <Oui.MenuEx
      className="min-w-56 rounded-lg"
      triggerElement={
        <Oui.Button
          variant="ghost"
          className="data-[hovered]:bg-sidebar-accent data-[hovered]:text-sidebar-accent-foreground data-[pressed]:bg-sidebar-accent data-[pressed]:text-sidebar-accent-foreground h-12 w-full justify-start overflow-hidden rounded-md p-2 text-left text-sm font-normal"
        >
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </Oui.Button>
      }
    >
      <Rac.MenuSection>
        <Rac.Header className="truncate px-1 py-1.5 text-center text-sm font-medium">
          {user.email}
        </Rac.Header>
      </Rac.MenuSection>
      <Oui.Separator variant="menu" />
      <Oui.MenuItem id="signOut" textValue="Sign Out">
        <LogOut className="mr-2 size-4" />
        <Rac.Form action="/signout" method="post" className="contents">
          <Oui.Button type="submit" variant="ghost">
            Sign Out
          </Oui.Button>
        </Rac.Form>
      </Oui.MenuItem>
    </Oui.MenuEx>
  );
}
