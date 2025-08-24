import type { Route } from "./+types/admin.users";
import { useCallback, useEffect, useState } from "react";
import { invariant } from "@epic-web/invariant";
import * as Oui from "@workspace/oui";
import * as Rac from "react-aria-components";
import { redirect, useFetcher, useNavigate } from "react-router";
import * as z from "zod";
import { FormErrorAlert } from "~/components/FormAlert";
import { appLoadContext } from "~/lib/middleware";

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const pageParam = url.searchParams.get("page");
  const filterParam = url.searchParams.get("filter");

  const PageSchema = z.preprocess((val) => {
    if (val == null) return undefined;
    const n = Number(String(val));
    return Number.isFinite(n) ? n : undefined;
  }, z.number().int().min(1).default(1));

  const FilterSchema = z.preprocess(
    (val) => (val == null ? "" : String(val)),
    z.string().default(""),
  );

  const page = PageSchema.parse(pageParam);
  const filter = FilterSchema.parse(filterParam);

  const limit = 5;
  const offset = (page - 1) * limit;

  const { auth } = context.get(appLoadContext);
  const result = await auth.api.listUsers({
    query: {
      limit,
      offset,
      searchField: "email",
      searchValue: filter || undefined,
      searchOperator: filter ? "contains" : undefined,
      sortBy: "email",
      sortDirection: "asc",
    },
    headers: request.headers,
  });
  invariant("limit" in result, "Expected 'limit' to be in result");
  const pageCount = Math.max(1, Math.ceil(result.total / limit));
  if (page > pageCount) {
    const u = new URL(request.url);
    u.searchParams.set("page", String(pageCount));
    return redirect(u.toString());
  }

  return {
    users: result.users,
    page,
    pageCount,
    filter,
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const schema = z.discriminatedUnion("intent", [
    z.object({
      intent: z.literal("ban"),
      userId: z.string(),
      banReason: z.string().max(4),
    }),
    z.object({ intent: z.literal("unban"), userId: z.string() }),
    z.object({ intent: z.literal("impersonate"), userId: z.string() }),
  ]);
  const parseResult = schema.safeParse(
    Object.fromEntries(await request.formData()),
  );
  if (!parseResult.success) {
    const { formErrors, fieldErrors: validationErrors } = z.flattenError(
      parseResult.error,
    );
    return { formErrors, validationErrors };
  }
  const { auth } = context.get(appLoadContext);
  switch (parseResult.data.intent) {
    case "ban":
      await auth.api.banUser({
        headers: request.headers,
        body: {
          userId: parseResult.data.userId,
          banReason: parseResult.data.banReason,
        },
      });
      return { success: true };
    case "unban":
      await auth.api.unbanUser({
        headers: request.headers,
        body: { userId: parseResult.data.userId },
      });
      return { success: true };
    case "impersonate": {
      const { headers } = await auth.api.impersonateUser({
        returnHeaders: true,
        headers: request.headers,
        body: { userId: parseResult.data.userId },
      });
      return redirect("/app", { headers });
    }
    default:
      void (parseResult.data satisfies never);
  }
}

/*
loaderData:

"users": [
    {
      "name": "Admin",
      "email": "a@a.com",
      "emailVerified": true,
      "image": null,
      "createdAt": "2025-08-22T19:07:35.000Z",
      "updatedAt": "2025-08-22T19:07:35.000Z",
      "role": "admin",
      "banned": false,
      "banReason": null,
      "banExpires": null,
      "id": "1"
    },
    {
      "name": "",
      "email": "u1@u.com",
      "emailVerified": true,
      "image": null,
      "createdAt": "2025-08-22T15:16:21.542Z",
      "updatedAt": "2025-08-22T15:16:21.542Z",
      "role": "user",
      "banned": false,
      "banReason": null,
      "banExpires": null,
      "id": "3"
    },
  ],
  "total": 2,
  "limit": 5
*/

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [banDialog, setBanDialog] = useState<{
    isOpen: boolean;
    userId?: string;
  }>({ isOpen: false });
  const onOpenChangeBanDialog = useCallback(
    (isOpen: boolean) =>
      setBanDialog((prev) =>
        prev.isOpen === isOpen
          ? prev
          : isOpen
            ? { ...prev, isOpen }
            : { isOpen: false, userId: undefined },
      ),
    [setBanDialog],
  );
  const fetcher = useFetcher(); // Caution: shared fetcher for simplicity.

  return (
    <div className="flex flex-col gap-8 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm">
          Manage your users and roles.
        </p>
      </header>

      <div>
        <Oui.SearchFieldEx
          aria-label="Filter by email"
          placeholder="Filter by email..."
          defaultValue={loaderData?.filter ?? ""}
          name="filter"
          onSubmit={(filter: string) => {
            navigate(`./?filter=${encodeURIComponent(filter)}&page=1`);
          }}
        />
      </div>

      <Oui.Table aria-label="Users">
        <Oui.TableHeader>
          <Oui.Column isRowHeader className="w-8">
            Id
          </Oui.Column>
          <Oui.Column>Email</Oui.Column>
          <Oui.Column>Role</Oui.Column>
          <Oui.Column>Verified</Oui.Column>
          <Oui.Column>Banned</Oui.Column>
          <Oui.Column>Ban Reason</Oui.Column>
          <Oui.Column>Created</Oui.Column>
          <Oui.Column className="w-10 text-right" aria-label="Actions">
            <span className="sr-only">Actions</span>
          </Oui.Column>
        </Oui.TableHeader>
        <Oui.TableBody items={loaderData.users}>
          {(user) => (
            <Oui.Row id={user.id}>
              <Oui.Cell>{user.id}</Oui.Cell>
              <Oui.Cell>{user.email}</Oui.Cell>
              <Oui.Cell>{user.role}</Oui.Cell>
              <Oui.Cell>{String(user.emailVerified)}</Oui.Cell>
              <Oui.Cell>{String(user.banned)}</Oui.Cell>
              <Oui.Cell>{user.banReason ?? ""}</Oui.Cell>
              <Oui.Cell>{user.createdAt.toLocaleString()}</Oui.Cell>
              <Oui.Cell className="text-right">
                <Oui.MenuEx
                  triggerElement={
                    <Oui.Button variant="ghost" className="size-8 p-0">
                      <span className="sr-only">
                        Open menu for {user.email}
                      </span>
                      ⋮
                    </Oui.Button>
                  }
                >
                  {user.banned ? (
                    <Oui.MenuItem
                      key="unban"
                      id="unban"
                      onAction={() => {
                        fetcher.submit(
                          new URLSearchParams({
                            intent: "unban",
                            userId: user.id,
                          }),
                          { method: "post" },
                        );
                      }}
                    >
                      Unban
                    </Oui.MenuItem>
                  ) : (
                    <Oui.MenuItem
                      key="ban"
                      id="ban"
                      onAction={() =>
                        setBanDialog({ isOpen: true, userId: user.id })
                      }
                    >
                      Ban
                    </Oui.MenuItem>
                  )}
                  <Oui.MenuItem
                    key="impersonate"
                    id="impersonate"
                    onAction={() => {
                      fetcher.submit(
                        new URLSearchParams({
                          intent: "impersonate",
                          userId: user.id,
                        }),
                        { method: "post" },
                      );
                    }}
                  >
                    Impersonate
                  </Oui.MenuItem>
                </Oui.MenuEx>
              </Oui.Cell>
            </Oui.Row>
          )}
        </Oui.TableBody>
      </Oui.Table>

      {loaderData && loaderData.pageCount > 1 && (
        <Oui.ListBoxEx1Pagination selectedKeys={[loaderData.page]}>
          <Oui.ListBoxItemEx1Pagination
            id="prev"
            href={`/admin/users?page=${loaderData.page > 1 ? loaderData.page - 1 : 1}${loaderData.filter ? `&filter=${encodeURIComponent(loaderData.filter)}` : ""}`}
            isDisabled={loaderData.page <= 1}
          >
            Previous
          </Oui.ListBoxItemEx1Pagination>
          {Array.from({ length: loaderData.pageCount }, (_, i) => (
            <Oui.ListBoxItemEx1Pagination
              key={i + 1}
              id={i + 1}
              href={`/admin/users?page=${i + 1}${loaderData.filter ? `&filter=${encodeURIComponent(loaderData.filter)}` : ""}`}
            >
              {i + 1}
            </Oui.ListBoxItemEx1Pagination>
          ))}
          <Oui.ListBoxItemEx1Pagination
            id="next"
            href={`/admin/users?page=${loaderData.page < loaderData.pageCount ? loaderData.page + 1 : loaderData.pageCount}${loaderData.filter ? `&filter=${encodeURIComponent(loaderData.filter)}` : ""}`}
            isDisabled={loaderData.page >= loaderData.pageCount}
          >
            Next
          </Oui.ListBoxItemEx1Pagination>
        </Oui.ListBoxEx1Pagination>
      )}

      <BanDialog
        key={banDialog.userId}
        userId={banDialog.userId}
        isOpen={banDialog.isOpen}
        onOpenChange={onOpenChangeBanDialog}
      />
    </div>
  );
}

/**
 * Dialog used to ban a user.
 *
 * The parent should pass `key={userId}` when rendering this component so
 * React will remount the dialog whenever the `userId` changes, preventing
 * stale hook state tied to a previous user.
 *
 * `onOpenChange` must be stable (e.g. wrapped with `useCallback`) to avoid runaway effect re-runs.
 * When `onOpenChange(false)` is invoked the parent should also clear
 * `userId` (set it to `undefined`) so the dialog unmounts cleanly and
 * doesn't retain a stale selection tied to a previous user.
 */
function BanDialog({
  userId,
  isOpen,
  onOpenChange,
}: {
  userId?: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const fetcher = useFetcher<Route.ComponentProps["actionData"]>();
  useEffect(() => {
    if (fetcher.data?.success) {
      onOpenChange(false);
    }
  }, [fetcher.data?.success, onOpenChange]);

  if (!userId) return null; // After hooks per Rules of Hooks.
  return (
    <Oui.DialogEx isOpen={isOpen} onOpenChange={onOpenChange}>
      <Rac.Form
        validationBehavior="aria"
        validationErrors={fetcher.data?.validationErrors}
        onSubmit={(e) => {
          e.preventDefault();
          fetcher.submit(e.currentTarget, { method: "post" });
        }}
        className="flex flex-col gap-4"
      >
        <Oui.DialogHeader>
          <Oui.Heading slot="title">Ban User</Oui.Heading>
        </Oui.DialogHeader>
        <FormErrorAlert formErrors={fetcher.data?.formErrors} />
        <Oui.TextFieldEx
          name="banReason"
          label="Reason"
          defaultValue=""
          autoFocus
        />
        <input type="hidden" name="userId" value={userId ?? ""} />
        <input type="hidden" name="intent" value="ban" />
        <Oui.DialogFooter>
          <Oui.Button variant="outline" slot="close">
            Cancel
          </Oui.Button>
          {/* Do not set slot='close' — we keep the dialog open until the server confirms success. */}
          <Oui.Button type="submit" isDisabled={fetcher.state !== "idle"}>
            Ban
          </Oui.Button>
        </Oui.DialogFooter>
      </Rac.Form>
    </Oui.DialogEx>
  );
}
