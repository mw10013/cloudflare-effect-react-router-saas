import type { AccountMember, User } from "~/lib/Domain";
import type { Route } from "./+types/app.$accountId.members";
import * as Oui from "@workspace/oui";
import { SchemaEx } from "@workspace/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import { Effect, Schema } from "effect";
import * as Rac from "react-aria-components";
import { redirect } from "react-router";
import { Email } from "~/lib/Domain";
import { IdentityMgr } from "~/lib/IdentityMgr";
import * as Policy from "~/lib/Policy";
import * as ReactRouter from "~/lib/ReactRouter";

/*
#fetch https://react-spectrum.adobe.com/react-aria/GridList.html
#fetch https://react-spectrum.adobe.com/react-aria/ListBox.html
*/

export const loader = ReactRouter.routeEffect(() =>
  Effect.gen(function* () {
    const appLoadContext = yield* ReactRouter.AppLoadContext;
    const accountMember = yield* Effect.fromNullable(
      appLoadContext.accountMember,
    );
    const members = yield* IdentityMgr.getAccountMembers(accountMember.account);
    return {
      accountMember,
      userId: accountMember.userId,
      ownerId: accountMember.account.userId,
      canEdit: appLoadContext.permissions.has("member:edit"),
      members,
    };
  }),
);

const inviteMembers = (emails: ReadonlySet<User["email"]>) =>
  ReactRouter.AppLoadContext.pipe(
    Effect.flatMap((appLoadContext) =>
      Effect.fromNullable(appLoadContext.accountMember),
    ),
    Effect.flatMap((accountMember) =>
      IdentityMgr.invite({
        emails,
        accountId: accountMember.accountId,
        accountEmail: accountMember.account.user.email,
      }),
    ),
    Policy.withPolicy(Policy.permission("member:edit")),
  );

const revokeMember = (accountMemberId: AccountMember["accountMemberId"]) =>
  ReactRouter.AppLoadContext.pipe(
    Effect.flatMap((appLoadContext) =>
      Effect.fromNullable(appLoadContext.accountMember?.account.accountId).pipe(
        Effect.flatMap((accountId) =>
          IdentityMgr.revokeAccountMembership({ accountMemberId, accountId }),
        ),
      ),
    ),
    Policy.withPolicy(Policy.permission("member:edit")),
  );

const leaveAccount = (accountMemberId: AccountMember["accountMemberId"]) =>
  ReactRouter.AppLoadContext.pipe(
    Effect.flatMap((appLoadContext) =>
      Effect.fromNullable(appLoadContext.accountMember?.userId).pipe(
        Effect.flatMap((userId) =>
          IdentityMgr.leaveAccountMembership({ accountMemberId, userId }),
        ),
      ),
    ),
    Effect.map(() => redirect("/app")),
    Policy.withPolicy(
      Policy.all(
        Policy.isCurrentAccountMember(accountMemberId),
        Policy.isCurrentAccountMemberNotAccountOwner,
      ),
    ),
  );

/*
#fetch https://effect.website/docs/schema/basic-usage/
#fetch https://effect.website/docs/schema/filters/
#fetch https://effect.website/docs/schema/transformations/
#fetch https://effect.website/docs/schema/advanced-usage/

#fetch https://effect.website/docs/schema/transformations/
#fetch https://effect.website/docs/schema/error-messages/
#fetch https://effect.website/docs/schema/annotations/
#fetch https://effect.website/docs/schema/error-formatters/
*/

export const action = ReactRouter.routeEffect(({ request }: Route.ActionArgs) =>
  Effect.gen(function* () {
    const FormDataSchema = Schema.Union(
      Schema.Struct({
        intent: Schema.Literal("invite"),
        emails: Schema.compose(
          Schema.compose(Schema.NonEmptyString, Schema.split(",")),
          Schema.ReadonlySet(Email),
        )
          .annotations({
            message: () => ({
              message: "Please provide valid email addresses.",
              override: true,
            }),
          })
          .pipe(
            Schema.filter((s: ReadonlySet<Email>) => s.size <= 3, {
              message: () => "Too many email addresses.",
            }),
          ),
      }),
      Schema.Struct({
        intent: Schema.Union(Schema.Literal("revoke"), Schema.Literal("leave")),
        accountMemberId: Schema.NumberFromString,
      }),
    );
    const formData = yield* SchemaEx.decodeRequestFormData({
      request,
      schema: FormDataSchema,
    });
    switch (formData.intent) {
      case "invite":
        return yield* inviteMembers(formData.emails);
      case "revoke":
        return yield* revokeMember(formData.accountMemberId);
      case "leave":
        return yield* leaveAccount(formData.accountMemberId);
      default:
        return yield* Effect.fail(new Error("Invalid intent"));
    }
  }).pipe(SchemaEx.catchValidationError),
);

/**
 * ## Member Management Capabilities
 *
 * | Action         | Account Owner | canEdit | ABAC: User is this Member |
 * | :------------- | :------------ | :------ | :------------------------ |
 * | Invite members | N/A           | Yes     | N/A                       |
 * | Revoke member  | N/A           | Yes     | N/A                       |
 * | Leave account  | No            | N/A     | Yes (if not owner)        |
 */
export default function RouteComponent({
  loaderData: { members, userId, ownerId, canEdit, accountMember },
  actionData,
}: Route.ComponentProps) {
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
        <CardContent>
          <Rac.Form
            method="post"
            className="grid gap-6"
            validationErrors={actionData?.validationErrors}
          >
            <Oui.TextFieldEx
              name="emails"
              label="Email Addresses"
              type="text"
              placeholder="e.g., user1@example.com, user2@example.com"
              isDisabled={!canEdit}
            />
            <Oui.Button
              type="submit"
              name="intent"
              value="invite"
              variant="outline"
              isDisabled={!canEdit}
              aria-label={
                canEdit
                  ? "Send Invites"
                  : "Invite action disabled: Requires 'member:edit' permission"
              }
              className="justify-self-end"
            >
              Send Invites
            </Oui.Button>
          </Rac.Form>
        </CardContent>
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
                const canRevokeThisMember = canEdit && !isOwner;
                const canLeaveAccount = isCurrentUser && !isOwner;

                return (
                  <li
                    key={member.accountMemberId}
                    className="flex flex-wrap items-center justify-between gap-4 py-4"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {member.user.email}
                      {member.status === "pending" && (
                        <span className="text-muted-foreground text-xs font-normal">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {isCurrentUser && canLeaveAccount && (
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
                            aria-label="Leave this account"
                          >
                            Leave
                          </Oui.Button>
                        </Rac.Form>
                      )}
                      {!isCurrentUser && canRevokeThisMember && (
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
                            aria-label={`Revoke access for ${member.user.email}`}
                          >
                            Revoke
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
          {
            actionData,
            accountMember,
            members,
            userId,
            ownerId,
            canEdit,
          },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
