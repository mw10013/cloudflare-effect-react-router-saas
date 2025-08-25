import type { Route } from "./+types/app.$organizationId._index";
import { invariant } from "@epic-web/invariant";
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
import * as z from "zod";
import { FormErrorAlert } from "~/components/FormAlert";
import { appLoadContext } from "~/lib/middleware";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { auth, session } = context.get(appLoadContext);
  invariant(session, "Missing session");
  return {
    invitations: (
      await auth.api.listUserInvitations({
        headers: request.headers,
        query: { email: session.user.email },
      })
    ).filter((v) => v.status === "pending"),
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const schema = z.discriminatedUnion("intent", [
    z.object({
      intent: z.literal("accept"),
      invitationId: z.string().min(1, "Invitation is required"),
    }),
    z.object({
      intent: z.literal("reject"),
      invitationId: z.string().min(1, "Invitation is required"),
    }),
  ]);
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
  switch (parseResult.data.intent) {
    case "accept":
      await auth.api.acceptInvitation({
        body: { invitationId: parseResult.data.invitationId },
        headers: request.headers,
      });
      return { success: "Invitation accepted." };
    case "reject":
      await auth.api.rejectInvitation({
        body: { invitationId: parseResult.data.invitationId },
        headers: request.headers,
      });
      return { success: "Invitation rejected." };
    default:
      void (parseResult.data satisfies never);
  }
}

export default function RouteComponent({
  loaderData: { invitations },
  actionData,
}: Route.ComponentProps) {
  const submit = useSubmit();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // https://developer.mozilla.org/en-US/docs/Web/API/SubmitEvent
    if (
      event.nativeEvent instanceof SubmitEvent &&
      event.nativeEvent.submitter &&
      (event.nativeEvent.submitter instanceof HTMLButtonElement ||
        event.nativeEvent.submitter instanceof HTMLInputElement)
    ) {
      submit(event.nativeEvent.submitter);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {actionData?.success && (
        <Oui.Text className="text-success">{actionData.success}</Oui.Text>
      )}
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
                  <Rac.Form
                    onSubmit={handleFormSubmit}
                    method="post"
                    validationBehavior="aria"
                    validationErrors={actionData?.validationErrors}
                    className="flex flex-col gap-2"
                  >
                    <FormErrorAlert formErrors={actionData?.formErrors} />
                    <input type="hidden" name="invitationId" value={inv.id} />
                    <div className="flex gap-2">
                      <Oui.Button
                        type="submit"
                        name="intent"
                        value="accept"
                        variant="outline"
                        size="sm"
                      >
                        Accept
                      </Oui.Button>
                      <Oui.Button
                        type="submit"
                        name="intent"
                        value="reject"
                        variant="destructive"
                        size="sm"
                      >
                        Reject
                      </Oui.Button>
                    </div>
                  </Rac.Form>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <pre>{JSON.stringify({ invitations, actionData }, null, 2)}</pre>
    </div>
  );
}
