import type { Permission } from "~/lib/Policy";
import type { Route } from "./+types/app.$accountId.members";
import * as Oui from "@workspace/oui";
import { SchemaEx } from "@workspace/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import { Effect, Schema } from "effect";
import * as Rac from "react-aria-components";
import { IdentityMgr } from "~/lib/IdentityMgr";
import * as ReactRouter from "~/lib/ReactRouter";

/*
#fetch https://react-spectrum.adobe.com/react-aria/GridList.html
#fetch https://react-spectrum.adobe.com/react-aria/ListBox.html
*/

export const loader = ReactRouter.routeEffect(({ context }) =>
  Effect.gen(function* () {
    const loadContext = context.get(ReactRouter.appLoadContext);
    const accountMember = yield* Effect.fromNullable(loadContext.accountMember);
    const members = yield* IdentityMgr.getAccountMembers(accountMember.account);
    return {
      members,
      userId: accountMember.userId,
      accountId: accountMember.accountId,
      ownerId: accountMember.account.userId,
      permissions: Array.from(loadContext.permissions) as Permission[],
    };
  }),
);

export const action = ReactRouter.routeEffect(
  ({ request, context }: Route.ActionArgs) =>
    Effect.gen(function* () {
      const FormDataSchema = Schema.Union(
        Schema.Struct({
          intent: Schema.Literal("invite"),
          emails: Schema.transform(
            Schema.compose(Schema.NonEmptyString, Schema.split(",")),
            Schema.Array(Schema.String),
            {
              strict: false,
              decode: (emails) => [
                ...new Set(emails.map((email) => email.trim())),
              ],
              encode: (emails) => emails,
            },
          ),
        }),
        Schema.Struct({
          intent: Schema.Literal("revoke"),
          accountMemberId: Schema.NumberFromString,
        }),
      );
      const formData = yield* SchemaEx.decodeRequestFormData({
        request,
        schema: FormDataSchema,
      });
      switch (formData.intent) {
        case "invite":
          return {
            formData,
            invite: yield* IdentityMgr.invite({
              emails: formData.emails,
              ...(yield* Effect.fromNullable(
                context.get(ReactRouter.appLoadContext).account,
              ).pipe(
                Effect.map((account) => ({
                  accountId: account.accountId,
                  accountEmail: account.user.email,
                })),
              )),
            }),
          };
          break;
        case "revoke":
          yield* IdentityMgr.revokeAccountMembership({
            accountMemberId: formData.accountMemberId,
          });
          return {
            message: `Account membership revoked: accountMemberId: ${formData.accountMemberId}`,
            formData,
          };
          break;
        default:
          return yield* Effect.fail(new Error("Invalid intent"));
      }
    }),
);

/**
 * ## Member Management Capabilities
 *
 * | Action             | Account Owner | Permission: `member:edit` | ABAC: User is this Member |
 * | :----------------- | :------------ | :------------------------ | :------------------------ |
 * | Invite members     | N/A           | Yes                       | N/A                       |
 * | Revoke member      | N/A           | Yes                       | N/A                       |
 * | Leave account      | No            | N/A                       | Yes (if not owner)        |
 */
export default function RouteComponent({
  loaderData: { members, accountId, permissions, userId, ownerId },
  actionData,
}: Route.ComponentProps) {
  const canInviteMembers = permissions.includes("member:edit");
  const canEditMembers = permissions.includes("member:edit");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Manage Account Members
        </h1>
        <p className="text-muted-foreground text-sm">
          Invite new members, manage existing ones, and control access to your
          account.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Invite New Members</CardTitle>
          <CardDescription>
            Enter email addresses separated by commas to send invitations.
          </CardDescription>
        </CardHeader>
        <Rac.Form method="post">
          <CardContent className="space-y-4">
            <Oui.TextFieldEx
              name="emails"
              label="Email Addresses"
              type="text"
              placeholder="e.g., user1@example.com, user2@example.com"
              isDisabled={!canInviteMembers}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Oui.Button
              type="submit"
              name="intent"
              value="invite"
              variant="outline"
              isDisabled={!canInviteMembers}
              aria-label={
                canInviteMembers
                  ? "Send Invites"
                  : "Invite action disabled: Requires 'member:edit' permission"
              }
            >
              Send Invites
            </Oui.Button>
          </CardFooter>
        </Rac.Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Account Members</CardTitle>
          <CardDescription>
            Review and manage members currently part of this account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members && members.length > 0 ? (
            <ul className="divide-border divide-y">
              {members.map((member) => {
                const isCurrentUser = member.user.userId === userId;
                const isOwner = member.user.userId === ownerId;
                const canRevokeThisMember = canEditMembers && !isOwner;
                const canLeaveAccount = isCurrentUser && !isOwner;

                return (
                  <li
                    key={member.accountMemberId}
                    className="flex flex-wrap items-center justify-between gap-4 py-4"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {member.user.email}
                      </span>
                      {isOwner && (
                        <span className="text-muted-foreground text-xs">
                          Account Owner
                        </span>
                      )}
                      {isCurrentUser && !isOwner && (
                        <span className="text-muted-foreground text-xs">
                          This is you
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {isCurrentUser ? (
                        <Rac.Form method="post">
                          <input
                            type="hidden"
                            name="accountMemberId"
                            value={member.accountMemberId}
                          />
                          <Oui.Button
                            type="submit"
                            name="intent"
                            value="leave"
                            variant="outline"
                            size="sm"
                            isDisabled={!canLeaveAccount}
                            aria-label={
                              !canLeaveAccount
                                ? "Leave account action disabled: Account owner cannot leave"
                                : "Leave this account"
                            }
                          >
                            Leave Account
                          </Oui.Button>
                        </Rac.Form>
                      ) : (
                        <Rac.Form method="post">
                          <input
                            type="hidden"
                            name="accountMemberId"
                            value={member.accountMemberId}
                          />
                          <Oui.Button
                            type="submit"
                            name="intent"
                            value="revoke"
                            variant="outline"
                            size="sm"
                            isDisabled={!canRevokeThisMember}
                            aria-label={
                              !canEditMembers
                                ? "Revoke action disabled: Requires 'member:edit' permission"
                                : isOwner
                                  ? "Revoke action disabled: Cannot revoke account owner"
                                  : `Revoke access for ${member.user.email}`
                            }
                          >
                            Revoke Access
                          </Oui.Button>
                        </Rac.Form>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              No members have been added to this account yet.
            </p>
          )}
        </CardContent>
      </Card>
      <pre>
        {JSON.stringify(
          { actionData, members, accountId, permissions, userId, ownerId },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
