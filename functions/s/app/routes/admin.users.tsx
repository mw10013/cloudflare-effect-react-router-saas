import type { Route } from "./+types/admin.users";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { invariant } from "@epic-web/invariant";
import * as Oui from "@workspace/oui";
import * as Rac from "react-aria-components";
import { useFetcher } from "react-router";
import * as z from "zod";
import { FormErrorAlert } from "~/components/FormAlert";
import { appLoadContext } from "~/lib/middleware";

export async function loader({ request, context }: Route.LoaderArgs) {
  const limit = 5;
  const { auth } = context.get(appLoadContext);
  const result = await auth.api.listUsers({
    query: {
      limit,
      sortBy: "email",
      sortDirection: "asc",
    },
    headers: request.headers,
  });
  invariant("limit" in result, "Expected 'limit' to be in result");
  return result;
}

export async function action({ request, context }: Route.ActionArgs) {
  const schema = z.discriminatedUnion("intent", [
    z.object({
      intent: z.literal("ban"),
      userId: z.string(),
      banReason: z.string().max(4).optional(),
    }),
    z.object({ intent: z.literal("unban"), userId: z.string() }),
  ]);

  const parseResult = schema.safeParse(
    Object.fromEntries(await request.formData()),
  );
  if (!parseResult.success) {
    const { formErrors, fieldErrors: validationErrors } = z.flattenError(
      parseResult.error,
    );
    console.log("admin.users: action: parse error", {
      formErrors,
      validationErrors,
    });
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
  const [banDialog, setBanDialog] = useState<{
    isOpen: boolean;
    userId?: string;
  }>({ isOpen: false });
  const fetcher = useFetcher();

  const onAction = (
    intent: "ban" | "unban",
    userId: string,
    banReason?: string,
  ) => {
    const formData = new FormData();
    formData.append("intent", intent);
    formData.append("userId", userId);
    if (banReason !== undefined) formData.append("banReason", banReason);
    fetcher.submit(formData, { method: "post" });
  };
  return (
    <BanPromiseDialogProvider>
      <div className="flex flex-col gap-8 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm">
            Manage your users and roles.
          </p>
        </header>

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
                        onAction={() => onAction("unban", user.id)}
                      >
                        Unban
                      </Oui.MenuItem>
                    ) : (
                      <>
                        <Oui.MenuItem
                          key="ban"
                          id="ban"
                          onAction={() =>
                            setBanDialog({ isOpen: true, userId: user.id })
                          }
                        >
                          Ban
                        </Oui.MenuItem>
                        <BanPromiseMenuItem userId={user.id} />
                      </>
                    )}
                  </Oui.MenuEx>
                </Oui.Cell>
              </Oui.Row>
            )}
          </Oui.TableBody>
        </Oui.Table>

        <BanDialog
          key={banDialog.userId}
          userId={banDialog.userId}
          isOpen={banDialog.isOpen}
          onOpenChange={(isOpen) =>
            setBanDialog((prev) => ({ ...prev, isOpen }))
          }
        />
      </div>
    </BanPromiseDialogProvider>
  );
}

function BanDialog({
  userId,
  isOpen,
  onOpenChange,
}: {
  userId?: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const fetcher = useFetcher();

  return (
    <Oui.DialogEx isOpen={isOpen} onOpenChange={onOpenChange}>
      <Rac.Form
        validationBehavior="aria"
        validationErrors={fetcher.data?.validationErrors}
        onSubmit={(e) => {
          e.preventDefault();
          console.log("BanDialog submitting", {
            userId,
            currentTarget: e.currentTarget,
          });
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
          <Oui.Button
            variant="outline"
            slot="close"
            onPress={() => onOpenChange(false)}
          >
            Cancel
          </Oui.Button>
          <Oui.Button type="submit">Ban</Oui.Button>
        </Oui.DialogFooter>
      </Rac.Form>
    </Oui.DialogEx>
  );
}

function BanPromiseMenuItem({ userId }: { userId: string }) {
  const { show } = useBanPromiseDialog();
  return (
    <Oui.MenuItem
      key="ban-promise"
      id="ban-promise"
      onAction={async () => {
        await show({ userId });
      }}
    >
      Ban Promise
    </Oui.MenuItem>
  );
}

const BanPromiseDialogContext = createContext<
  { show: (options: { userId: string }) => Promise<boolean> } | undefined
>(undefined);

function useBanPromiseDialog() {
  const context = useContext(BanPromiseDialogContext);
  if (!context)
    throw new Error(
      "useBanPromiseDialog must be used within BanPromiseDialogProvider",
    );
  return context;
}

function BanPromiseDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<{ userId: string } | null>(null);
  const [banReason, setBanReason] = useState("");
  const resolverRef = useRef<null | ((v: boolean) => void)>(null);
  const fetcher = useFetcher();
  const show = useCallback((o: { userId: string }) => {
    setBanReason("");
    setOpen({ userId: o.userId });
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);
  const close = useCallback((result: boolean) => {
    if (resolverRef.current) resolverRef.current(result);
    resolverRef.current = null;
    setOpen(null);
  }, []);
  const submitting = fetcher.state !== "idle";
  useEffect(() => {
    if (!open) return;
    if (
      fetcher.state === "idle" &&
      fetcher.data &&
      !(fetcher.data as any).validationErrors &&
      (fetcher.data as any).success
    ) {
      close(true);
    }
  }, [fetcher.state, fetcher.data, open, close]);
  return (
    <BanPromiseDialogContext.Provider value={{ show }}>
      {children}
      {open && (
        <Oui.DialogEx
          isOpen
          onOpenChange={(v) => {
            if (!v) close(false);
          }}
        >
          <Oui.DialogHeader>
            <Oui.Heading slot="title">Ban User</Oui.Heading>
          </Oui.DialogHeader>
          <fetcher.Form
            method="post"
            className="flex flex-col gap-4"
            onSubmit={() => {
              console.log("BanPromiseDialog submitting", {
                userId: open.userId,
                banReason,
              });
            }}
          >
            <input type="hidden" name="intent" value="ban" />
            <input type="hidden" name="userId" value={open.userId} />
            <Oui.Input
              name="banReason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason for ban..."
              autoFocus
              onFocus={(e) => e.target.select()}
            />
            {(fetcher.data as any)?.formErrors && (
              <ul className="text-destructive list-disc pl-4 text-sm">
                {(fetcher.data as any).formErrors.map((f: string) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            )}
            <Oui.DialogFooter>
              <Oui.Button
                variant="outline"
                onPress={() => close(false)}
                isDisabled={submitting}
              >
                Cancel
              </Oui.Button>
              <Oui.Button type="submit" isDisabled={submitting}>
                {submitting ? "Banning..." : "Ban"}
              </Oui.Button>
            </Oui.DialogFooter>
          </fetcher.Form>
        </Oui.DialogEx>
      )}
    </BanPromiseDialogContext.Provider>
  );
}
