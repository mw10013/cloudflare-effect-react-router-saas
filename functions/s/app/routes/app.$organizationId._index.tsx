import type { Route } from "./+types/app.$organizationId._index";
import * as Oui from "@workspace/oui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import * as Rac from "react-aria-components";
import { useSubmit } from "react-router";
import { appLoadContext } from "~/lib/middleware";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { auth, session } = context.get(appLoadContext);
  if (!session || !session.session.activeOrganizationId)
    throw new Error("Missing session or active organization");
  return {
    invitations: await auth.api.listUserInvitations({
      headers: request.headers,
      query: { email: session?.user.email },
    }),
  };
}

// export const action = ReactRouterEx.routeEffect(
//   ({ request }: Route.ActionArgs) =>
//     Effect.gen(function* () {
//       const userId = yield* ReactRouterEx.AppLoadContext.pipe(
//         Effect.flatMap((appLoadContext) =>
//           Effect.fromNullable(
//             appLoadContext.session.get("sessionUser")?.userId,
//           ),
//         ),
//       );
//       const FormDataSchema = Schema.Struct({
//         intent: Schema.Literal("accept", "decline"),
//         accountMemberId: AccountMemberIdFromString,
//       });
//       const formData = yield* SchemaEx.decodeRequestFormData({
//         request,
//         schema: FormDataSchema,
//       });
//       switch (formData.intent) {
//         case "accept":
//           yield* IdentityMgr.acceptInvitation({
//             accountMemberId: formData.accountMemberId,
//             userId,
//           });
//           break;
//         case "decline":
//           yield* IdentityMgr.declineInvitation({
//             accountMemberId: formData.accountMemberId,
//             userId,
//           });
//           break;
//         default:
//           return yield* Effect.fail(
//             new Error(`Invalid intent: ${formData.intent}`),
//           );
//       }
//     }),
// );

export default function RouteComponent({
  loaderData: { invitations },
}: Route.ComponentProps) {
  const submit = useSubmit();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nativeEvent = event.nativeEvent;
    // https://developer.mozilla.org/en-US/docs/Web/API/SubmitEvent
    if (nativeEvent instanceof SubmitEvent) {
      const submitter = nativeEvent.submitter;
      if (
        submitter &&
        (submitter instanceof HTMLButtonElement ||
          submitter instanceof HTMLInputElement)
      ) {
        submit(submitter);
      } else {
        console.error(
          "Form submission did not originate from a recognized button element (submitter was not a button).",
        );
      }
    } else {
      console.error("Form submission event was not a SubmitEvent.");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invitations</CardTitle>
            <CardDescription>
              Invitations awaiting your response.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4">
              {invitations.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex-grow text-sm">
                    <div>
                      Email: <span className="font-medium">{inv.email}</span>
                    </div>
                    <div>Inviter ID: {inv.inviterId}</div>
                    <div>Organization ID: {inv.organizationId}</div>
                    <div>Role: {inv.role}</div>
                    <div>Status: {inv.status}</div>
                    <div>
                      Expires:{" "}
                      {typeof inv.expiresAt === "string"
                        ? inv.expiresAt
                        : (inv.expiresAt?.toISOString?.() ??
                          String(inv.expiresAt))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Rac.Form onSubmit={handleFormSubmit} method="post">
                      <input type="hidden" name="invitationId" value={inv.id} />
                      <Oui.Button
                        type="submit"
                        name="intent"
                        value="accept"
                        variant="outline"
                        size="sm"
                      >
                        Accept
                      </Oui.Button>
                    </Rac.Form>
                    <Rac.Form onSubmit={handleFormSubmit} method="post">
                      <input type="hidden" name="invitationId" value={inv.id} />
                      <Oui.Button
                        type="submit"
                        name="intent"
                        value="reject"
                        variant="destructive"
                        size="sm"
                      >
                        Reject
                      </Oui.Button>
                    </Rac.Form>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <pre>{JSON.stringify({ invitations }, null, 2)}</pre>
    </div>
  );
}
