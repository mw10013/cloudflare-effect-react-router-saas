import type { Route } from "./+types/accept-invitation.$invitationId";
import * as Oui from "@workspace/oui";
import * as Rac from "react-aria-components";
import { redirect } from "react-router";
import { appLoadContext } from "~/lib/middleware";

export async function loader({
  context,
  params: { invitationId },
}: Route.LoaderArgs) {
  const { session } = context.get(appLoadContext);
  if (!session) return { needsAuth: true };
  return { needsAuth: false, invitationId };
}

export async function action({
  request,
  context,
  params: { invitationId },
}: Route.ActionArgs) {
  const { auth } = context.get(appLoadContext);
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (typeof invitationId !== "string" || !invitationId) {
    return { error: "Invalid invitation link." };
  }
  if (intent === "accept") {
    const response = await auth.api.acceptInvitation({
      body: { invitationId },
      headers: request.headers,
      asResponse: true,
    });
    console.log("accept-invitation: accept", response, await response.text());
    if (!response.ok) throw response;
  } else if (intent === "reject") {
    const response = await auth.api.rejectInvitation({
      body: { invitationId },
      headers: request.headers,
      asResponse: true,
    });
    console.log("accept-invitation: reject", response, await response.text());
    if (!response.ok) throw response;
  }
  return redirect("/app");
}

export default function RouteComponent({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  if (loaderData?.needsAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Oui.Text>
          You need to sign in or sign up to accept this invitation.
        </Oui.Text>
        <Oui.Link href="/login" className="mt-4">
          Go to Login
        </Oui.Link>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Rac.Form method="post" className="flex w-full max-w-sm flex-col gap-6">
        <Oui.Text>Would you like to accept or reject this invitation?</Oui.Text>
        {actionData?.error && (
          <Oui.Text className="text-destructive">{actionData.error}</Oui.Text>
        )}
        <div className="mt-4 flex gap-4">
          <Oui.Button
            type="submit"
            name="intent"
            value="accept"
            className="w-full"
          >
            Accept
          </Oui.Button>
          <Oui.Button
            type="submit"
            name="intent"
            value="reject"
            className="w-full"
          >
            Reject
          </Oui.Button>
        </div>
      </Rac.Form>
    </div>
  );
}
