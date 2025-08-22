import { invariant } from "@epic-web/invariant";
import type { Route } from "./+types/app.$organizationId.members";
import * as Oui from "@workspace/oui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import * as Rac from "react-aria-components";
import * as z from "zod";
import * as Domain from "~/lib/domain";
import { appLoadContext } from "~/lib/middleware";

export async function loader({
  request,
  context,
  params: { organizationId },
}: Route.LoaderArgs) {
  const { auth, session } = context.get(appLoadContext);
  invariant(session, "Missing session");
  return {
    fullOrganization: await auth.api.getFullOrganization({
      headers: request.headers,
      query: {
        organizationId,
      },
    }),
  };
}

export async function action({
  request,
  context,
  params: { organizationId },
}: Route.ActionArgs) {
  const schema = z.object({
    intent: z.literal("invite"),
    emails: z
      .string()
      .transform((v) =>
        v
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
      )
      .pipe(
        z
          .array(z.email("Please provide valid email addresses."))
          .min(1, "At least one email is required"),
      ),
    role: Domain.MemberRole.extract(["member", "admin"], "Role must be Member or Admin."),
  });
  const formData = await request.formData();
  const parseResult = schema.safeParse(Object.fromEntries(formData));
  if (!parseResult.success) {
    const { formErrors, fieldErrors: validationErrors } = z.flattenError(
      parseResult.error,
    );
    return {
      formErrors,
      validationErrors,
    };
  }
  const { auth } = context.get(appLoadContext);
  for (const email of parseResult.data.emails) {
    await auth.api.createInvitation({
      headers: request.headers,
      body: {
        email,
        role: parseResult.data.role,
        organizationId,
        resend: true,
      },
    });
  }
  return { success: "Invitations sent." };
}

export default function RouteComponent({
  loaderData: { fullOrganization },
  actionData,
}: Route.ComponentProps) {
  const canEdit = true;
  return (
    <div className="flex flex-col gap-8 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <p className="text-muted-foreground text-sm">
          Manage organization members and control access to your organization.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Current Members</CardTitle>
          <CardDescription>
            Review and manage members currently part of this organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* {members && members.length > 0 ? (
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
          )} */}
        </CardContent>
      </Card>
      <pre>{JSON.stringify({ fullOrganization, actionData }, null, 2)}</pre>
    </div>
  );
}

/**
 * ## Member Management Capabilities
 *
 * | Action         | Account Owner | canEdit | ABAC: User is this Member |
 * | :------------- | :------------ | :------ | :------------------------ |
 * | Invite members | N/A           | Yes     | N/A                       |
 * | Revoke member  | N/A           | Yes     | N/A                       |
 * | Leave account  | No            | N/A     | Yes (if not owner)        |
 */
// export default function RouteComponent({
//   loaderData: { members, userId, ownerId, canEdit, accountMember },
//   actionData,
// }: Route.ComponentProps) {
//   return (
//     <div className="space-y-8">
//       <header>
//         <h1 className="text-3xl font-bold tracking-tight">
//           Manage Account Members
//         </h1>
//         <p className="text-muted-foreground text-sm">
//           Invite new members, manage existing ones, and control access to your
//           account.
//         </p>
//       </header>

//       <Card>
//         <CardHeader>
//           <CardTitle>Invite New Members</CardTitle>
//           <CardDescription>
//             Enter email addresses separated by commas to send invitations.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Rac.Form
//             method="post"
//             className="grid gap-6"
//             validationErrors={actionData?.validationErrors}
//           >
//             <Oui.TextFieldEx
//               name="emails"
//               label="Email Addresses"
//               type="text"
//               placeholder="e.g., user1@example.com, user2@example.com"
//               isDisabled={!canEdit}
//             />
//             <Oui.Button
//               type="submit"
//               name="intent"
//               value="invite"
//               variant="outline"
//               isDisabled={!canEdit}
//               aria-label={
//                 canEdit
//                   ? "Send Invites"
//                   : "Invite action disabled: Requires 'member:edit' permission"
//               }
//               className="justify-self-end"
//             >
//               Send Invites
//             </Oui.Button>
//           </Rac.Form>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Current Account Members</CardTitle>
//           <CardDescription>
//             Review and manage members currently part of this account.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {members && members.length > 0 ? (
//             <ul className="divide-border divide-y">
//               {members.map((member) => {
//                 const isCurrentUser = member.user.userId === userId;
//                 const isOwner = member.user.userId === ownerId;
//                 const canRevokeThisMember = canEdit && !isOwner;
//                 const canLeaveAccount = isCurrentUser && !isOwner;

//                 return (
//                   <li
//                     key={member.accountMemberId}
//                     className="flex flex-wrap items-center justify-between gap-4 py-4"
//                   >
//                     <div className="flex items-center gap-2 text-sm font-medium">
//                       {member.user.email}
//                       {member.status === "pending" && (
//                         <span className="text-muted-foreground text-xs font-normal">
//                           Pending
//                         </span>
//                       )}
//                     </div>
//                     <div className="flex gap-2">
//                       {isCurrentUser && canLeaveAccount && (
//                         <Rac.Form method="post">
//                           <input
//                             type="hidden"
//                             name="accountMemberId"
//                             value={member.accountMemberId}
//                           />
//                           <Oui.Button
//                             type="submit"
//                             name="intent"
//                             value="leave"
//                             variant="outline"
//                             size="sm"
//                             aria-label="Leave this account"
//                           >
//                             Leave
//                           </Oui.Button>
//                         </Rac.Form>
//                       )}
//                       {!isCurrentUser && canRevokeThisMember && (
//                         <Rac.Form method="post">
//                           <input
//                             type="hidden"
//                             name="accountMemberId"
//                             value={member.accountMemberId}
//                           />
//                           <Oui.Button
//                             type="submit"
//                             name="intent"
//                             value="revoke"
//                             variant="outline"
//                             size="sm"
//                             aria-label={`Revoke access for ${member.user.email}`}
//                           >
//                             Revoke
//                           </Oui.Button>
//                         </Rac.Form>
//                       )}
//                     </div>
//                   </li>
//                 );
//               })}
//             </ul>
//           ) : (
//             <p className="text-muted-foreground text-sm">
//               No members have been added to this account yet.
//             </p>
//           )}
//         </CardContent>
//       </Card>
//       <pre>
//         {JSON.stringify(
//           {
//             actionData,
//             accountMember,
//             members,
//             userId,
//             ownerId,
//             canEdit,
//           },
//           null,
//           2,
//         )}
//       </pre>
//     </div>
//   );
// }
