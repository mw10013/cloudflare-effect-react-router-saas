import type { Route } from "./+types/admin.users";
import * as Oui from "@workspace/oui";
import { SchemaEx } from "@workspace/shared";
import { Effect, Schema } from "effect";
import { IdentityMgr } from "~/lib/IdentityMgr";
import * as ReactRouter from "~/lib/ReactRouter";

export const loader = ReactRouter.routeEffect(() =>
  IdentityMgr.getUsers().pipe(Effect.map((users) => ({ users }))),
);

// export const action = ReactRouter.routeEffect(({ request }: Route.ActionArgs) =>
//   Effect.gen(function* () {
//     const FormDataSchema = Schema.Union(
//       Schema.Struct({
//         intent: Schema.Literal("invite"),
//         emails: Schema.compose(
//           Schema.compose(Schema.NonEmptyString, Schema.split(",")),
//           Schema.ReadonlySet(Email),
//         )
//           .annotations({
//             message: () => ({
//               message: "Please provide valid email addresses.",
//               override: true,
//             }),
//           })
//           .pipe(
//             Schema.filter((s: ReadonlySet<Email>) => s.size <= 3, {
//               message: () => "Too many email addresses.",
//             }),
//           ),
//       }),
//       Schema.Struct({
//         intent: Schema.Union(Schema.Literal("revoke"), Schema.Literal("leave")),
//         accountMemberId: AccountMemberIdFromString,
//       }),
//     );
//     const formData = yield* SchemaEx.decodeRequestFormData({
//       request,
//       schema: FormDataSchema,
//     });
//     switch (formData.intent) {
//       case "invite":
//         yield* inviteMembers(formData.emails);
//         break;
//       case "revoke":
//         yield* revokeMember(formData.accountMemberId);
//         break;
//       case "leave":
//         yield* leaveAccount(formData.accountMemberId);
//         break;
//       default:
//         yield* Effect.fail(new Error("Invalid intent"));
//         break;
//     }
//   }).pipe(
//     SchemaEx.catchValidationError,
//     // Using `Effect.catchIf` because `Effect.catchTag` would prevent other errors
//     // from propagating to the main `routeEffect` handler unless explicitly re-thrown.
//     Effect.catchIf(
//       (e: unknown): e is InviteError => e instanceof InviteError,
//       (error: InviteError) =>
//         Effect.succeed({ validationErrors: { emails: error.message } }),
//     ),
//   ),
// );

export default function RouteComponent({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <Oui.Table aria-label="Users">
      <Oui.TableHeader>
        <Oui.Column isRowHeader className="w-[80px]">
          Id
        </Oui.Column>
        <Oui.Column>Email</Oui.Column>
        <Oui.Column>Name</Oui.Column>
        <Oui.Column>Type</Oui.Column>
        <Oui.Column>Note</Oui.Column>
        <Oui.Column>Created</Oui.Column>
        <Oui.Column>Locked</Oui.Column>
        <Oui.Column>Deleted</Oui.Column>
        <Oui.Column className="w-10 text-right" aria-label="Actions">
          <span className="sr-only">Actions</span>
        </Oui.Column>
      </Oui.TableHeader>
      <Oui.TableBody items={loaderData?.users ?? []}>
        {(user) => (
          <Oui.Row id={user.userId}>
            <Oui.Cell className="font-mono">{user.userId}</Oui.Cell>
            <Oui.Cell>{user.email}</Oui.Cell>
            <Oui.Cell>{user.name}</Oui.Cell>
            <Oui.Cell>{user.userType}</Oui.Cell>
            <Oui.Cell>{user.note}</Oui.Cell>
            <Oui.Cell>
              {user.createdAt ? new Date(user.createdAt).toLocaleString() : ""}
            </Oui.Cell>
            <Oui.Cell>
              {user.lockedAt ? new Date(user.lockedAt).toLocaleString() : ""}
            </Oui.Cell>
            <Oui.Cell>
              {user.deletedAt ? new Date(user.deletedAt).toLocaleString() : ""}
            </Oui.Cell>
            <Oui.Cell className="text-right">
              <Oui.MenuEx
                triggerElement={
                  <Oui.Button variant="ghost" className="size-8 p-0">
                    <span className="sr-only">Open menu for {user.email}</span>⋮
                  </Oui.Button>
                }
              >
                <Oui.MenuItem id="lock">Lock</Oui.MenuItem>
                <Oui.MenuItem id="delete">Delete</Oui.MenuItem>
              </Oui.MenuEx>
            </Oui.Cell>
          </Oui.Row>
        )}
      </Oui.TableBody>
    </Oui.Table>
  );
}
