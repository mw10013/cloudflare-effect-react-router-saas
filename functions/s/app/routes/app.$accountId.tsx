import type { Route } from "./+types/app.$accountId";
import React from "react";
import * as Oui from "@workspace/oui";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/ui/sidebar";
import { Effect, Schema } from "effect";
import { ChevronsUpDown, LogOut } from "lucide-react";
import * as Rac from "react-aria-components";
import { Outlet, redirect, useNavigate } from "react-router";
import {
  Account,
  AccountMemberWithAccount,
  AccountWithUser,
  SessionUser,
} from "~/lib/Domain";
import { IdentityMgr } from "~/lib/IdentityMgr";
import * as Policy from "~/lib/Policy";
import * as ReactRouterEx from "~/lib/ReactRouterEx";

const accountMiddleware: Route.unstable_MiddlewareFunction =
  ReactRouterEx.middlewareEffect(({ params, context }) =>
    Effect.gen(function* () {
      const appLoadContext = context.get(ReactRouterEx.appLoadContext);
      const AccountIdFromPath = Schema.compose(
        Schema.NumberFromString,
        Account.fields.accountId,
      );
      const accountId = yield* Schema.decodeUnknown(AccountIdFromPath)(
        params.accountId,
      );
      const accountMember = yield* Effect.fromNullable(
        appLoadContext.session.get("sessionUser"),
      ).pipe(
        Effect.flatMap((sessionUser) =>
          IdentityMgr.getAccountMemberForAccount({
            accountId,
            userId: sessionUser.userId,
          }),
        ),
        Effect.catchTag("NoSuchElementException", () => Effect.succeed(null)),
      );
      if (!accountMember) {
        return yield* Effect.fail(redirect("/app"));
      }
      context.set(ReactRouterEx.appLoadContext, {
        ...appLoadContext,
        accountMember,
        permissions: Policy.getAccountMemberRolePermissions(accountMember.role),
      });
    }),
  );

export const unstable_middleware = [accountMiddleware];

export const loader = ReactRouterEx.routeEffect(() =>
  Effect.gen(function* () {
    const appLoadContext = yield* ReactRouterEx.AppLoadContext;
    const sessionUser = yield* Effect.fromNullable(
      appLoadContext.session.get("sessionUser"),
    );
    return {
      accountMember: yield* Effect.fromNullable(appLoadContext.accountMember),
      accounts: yield* IdentityMgr.getAccounts(sessionUser),
      sessionUser,
    };
  }),
);

/**
 * The `<main>` element uses `h-svh` for a stable height, essential for this app shell layout.
 * `h-dvh` is avoided because it causes jarring content reflows on mobile when browser UI resizes,
 * which is unsuitable for a layout with internal-only scrolling.
 */
export default function RouteComponent({
  loaderData: { accountMember, accounts, sessionUser },
}: Route.ComponentProps) {
  return (
    <SidebarProvider>
      <AppSidebar
        accountMember={accountMember}
        accounts={accounts}
        sessionUser={sessionUser}
      />
      <main className="flex h-svh w-full flex-col">
        <SidebarTrigger />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

export function AppSidebar({
  accountMember,
  accounts,
  sessionUser,
}: {
  accountMember: AccountMemberWithAccount;
  accounts: AccountWithUser[];
  sessionUser: SessionUser;
}) {
  const items = [
    {
      id: "Account Home",
      href: `/app/${accountMember.account.accountId}`,
    },
    {
      id: "AI",
      href: `/app/${accountMember.account.accountId}/ai`,
    },
    {
      id: "AI1",
      href: `/app/${accountMember.account.accountId}/ai1`,
    },
    {
      id: "AI2",
      href: `/app/${accountMember.account.accountId}/ai2`,
    },
    {
      id: "Members",
      href: `/app/${accountMember.account.accountId}/members`,
    },
    {
      id: "Billing",
      href: `/app/${accountMember.account.accountId}/billing`,
    },
  ];

  const YourAppLogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" {...props}>
      <circle cx="50" cy="50" r="40" fill="currentColor" />
    </svg>
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex w-full items-center gap-2 p-2">
          <Rac.Link href="/" aria-label="Home">
            <YourAppLogoIcon className="text-primary size-7" />
          </Rac.Link>
          {accounts.length > 0 && (
            <AccountSwitcher
              accounts={accounts}
              currentAccountId={accountMember.account.accountId}
            />
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Oui.SidebarTreeEx aria-label="Account Navigation" items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            email: sessionUser.email,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}

export function AccountSwitcher({
  accounts,
  currentAccountId,
}: {
  accounts: AccountWithUser[];
  currentAccountId: number;
}) {
  const navigate = useNavigate();
  const activeAccount = accounts.find(
    (acc) => acc.accountId === currentAccountId,
  );

  if (!activeAccount) {
    return null;
  }

  const handleAccountSelection = (key: React.Key) => {
    navigate(`/app/${key}`);
  };

  return (
    <Oui.MenuEx
      className="min-w-56 rounded-lg"
      onAction={handleAccountSelection}
      triggerElement={
        <Oui.Button
          variant="ghost"
          className="h-auto flex-1 items-center justify-between p-0 text-left font-medium data-[hovered]:bg-transparent"
        >
          <div className="grid leading-tight">
            <span className="truncate font-medium">
              {activeAccount.user.email}
            </span>
            {/* Optionally display planName if needed and available */}
            {/* activeAccount.planName && <span className="text-muted-foreground truncate text-xs">{activeAccount.planName}</span> */}
          </div>
          <ChevronsUpDown className="text-muted-foreground ml-2 size-4" />
        </Oui.Button>
      }
    >
      <Rac.MenuSection>
        <Oui.Header>Switch Account</Oui.Header>
        {accounts.map((account) => (
          <Oui.MenuItem
            key={account.accountId}
            id={account.accountId.toString()} // id should be a string
            textValue={account.user.email}
            className="p-2"
          >
            {account.user.email}
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
