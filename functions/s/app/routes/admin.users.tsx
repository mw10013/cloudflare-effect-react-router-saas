import type { Route } from "./+types/admin.users";
import { useEffect, useState } from "react";
import { invariant } from "@epic-web/invariant";
import * as Oui from "@workspace/oui";
import { useFetcher } from "react-router";
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
                    <Oui.MenuItem
                      key="ban"
                      id="ban"
                      onAction={() =>
                        setBanDialog({
                          isOpen: true,
                          userId: user.id,
                        })
                      }
                    >
                      Ban
                    </Oui.MenuItem>
                  )}
                </Oui.MenuEx>
              </Oui.Cell>
            </Oui.Row>
          )}
        </Oui.TableBody>
      </Oui.Table>

      <BanDialog
        key={banDialog.userId}
        isOpen={banDialog.isOpen}
        onOpenChange={(isOpen) => setBanDialog((prev) => ({ ...prev, isOpen }))}
        onConfirm={(reason) => {
          if (banDialog.userId !== undefined) {
            onAction("ban", banDialog.userId, reason);
          }
        }}
      />
    </div>
  );
}

function BanDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (banReason: string) => void;
}) {
  const [banReason, setBanReason] = useState("");

  const handleConfirm = () => {
    onConfirm(banReason);
    onOpenChange(false);
  };

  return (
    <Oui.DialogEx isOpen={isOpen} onOpenChange={onOpenChange}>
      <Oui.DialogHeader>
        <Oui.Heading slot="title">Ban User</Oui.Heading>
      </Oui.DialogHeader>
      <div>
        <p className="text-muted-foreground mb-2 text-sm">
          Provide a reason for banning this user (optional).
        </p>
        <Oui.Input
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          placeholder="Reason for ban..."
          autoFocus
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleConfirm();
            }
          }}
        />
      </div>
      <Oui.DialogFooter>
        <Oui.Button
          variant="outline"
          slot="close"
          onPress={() => onOpenChange(false)}
        >
          Cancel
        </Oui.Button>
        <Oui.Button slot="close" onPress={handleConfirm}>
          Ban
        </Oui.Button>
      </Oui.DialogFooter>
    </Oui.DialogEx>
  );
}
