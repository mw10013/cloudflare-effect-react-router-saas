import type { Route } from "./+types/app.$accountId";
import React from "react";
import * as Oui from "@workspace/oui";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@workspace/ui/components/ui/sidebar";
import { Effect, Schema } from "effect";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
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
import * as ReactRouter from "~/lib/ReactRouter";

const accountMiddleware: Route.unstable_MiddlewareFunction =
  ReactRouter.middlewareEffect(({ params, context }) =>
    Effect.gen(function* () {
      const appLoadContext = context.get(ReactRouter.appLoadContext);
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
        Effect.orElseSucceed(() => null),
      );
      if (!accountMember) {
        return yield* Effect.fail(redirect("/app"));
      }
      context.set(ReactRouter.appLoadContext, {
        ...appLoadContext,
        accountMember,
        permissions: Policy.getAccountMemberRolePermissions(accountMember.role),
      });
    }),
  );

export const unstable_middleware = [accountMiddleware];

export const loader = ReactRouter.routeEffect(({ context }) =>
  Effect.gen(function* () {
    const appLoadContext = context.get(ReactRouter.appLoadContext);
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

export default function RouteComponent({
  loaderData: { accountMember, accounts, sessionUser },
}: Route.ComponentProps) {
  return (
    <div className="">
      <SidebarProvider>
        <AppSidebar
          accountMember={accountMember}
          accounts={accounts}
          sessionUser={sessionUser}
        />
        <main>
          <SidebarTrigger />
          <div className="flex flex-col gap-2 p-6">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </div>
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
        <SidebarGroup>
          <SidebarGroupContent>
            <Oui.SidebarListBox aria-label="Account Navigation" items={items}>
              {(item) => (
                <Oui.SidebarListBoxItem key={item.id} href={item.href}>
                  {item.id}
                </Oui.SidebarListBoxItem>
              )}
            </Oui.SidebarListBox>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: sessionUser.email,
            email: sessionUser.email,
            avatar: "/avatars/shadcn.jpg",
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
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();

  return (
    <Oui.MenuEx
      className="min-w-56 rounded-lg"
      triggerElement={
        <Oui.Button
          variant="ghost"
          className="data-[hovered]:bg-sidebar-accent data-[hovered]:text-sidebar-accent-foreground data-[pressed]:bg-sidebar-accent data-[pressed]:text-sidebar-accent-foreground h-12 w-full justify-start overflow-hidden rounded-md p-2 text-left text-sm font-normal"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </Oui.Button>
      }
    >
      <Rac.MenuSection>
        <Rac.Header>
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </Rac.Header>
      </Rac.MenuSection>
      <Oui.Separator variant="menu" />
      <Rac.MenuSection>
        <Oui.MenuItem id="upgradeToPro" textValue="Upgrade to Pro">
          <Sparkles className="mr-2 size-4" />
          Upgrade to Pro
        </Oui.MenuItem>
      </Rac.MenuSection>
      <Oui.Separator variant="menu" />
      <Rac.MenuSection>
        <Oui.MenuItem id="account" textValue="Account">
          <BadgeCheck className="mr-2 size-4" />
          Account
        </Oui.MenuItem>
        <Oui.MenuItem id="billing" textValue="Billing">
          <CreditCard className="mr-2 size-4" />
          Billing
        </Oui.MenuItem>
        <Oui.MenuItem id="notifications" textValue="Notifications">
          <Bell className="mr-2 size-4" />
          Notifications
        </Oui.MenuItem>
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
