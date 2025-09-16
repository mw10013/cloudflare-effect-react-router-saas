import type { Route } from "./+types/accept-invitation.$invitationId";
import * as Oui from "@workspace/oui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import * as Rac from "react-aria-components";
import { redirect } from "react-router";
import * as z from "zod";
import { appLoadContext } from "~/lib/middleware";

export function loader({
  context,
  params: { invitationId },
}: Route.LoaderArgs) {
  const { session } = context.get(appLoadContext);
  return { needsAuth: !session, invitationId };
}

export async function action({
  request,
  context,
  params: { invitationId },
}: Route.ActionArgs) {
  const schema = z.object({
    intent: z.enum(["accept", "reject"]),
  });
  const formData = await request.formData();
  const parseResult = schema.parse(Object.fromEntries(formData));
  const { auth } = context.get(appLoadContext);
  if (parseResult.intent === "accept") {
    await auth.api.acceptInvitation({
      body: { invitationId },
      headers: request.headers,
    });
  } else if (parseResult.intent === "reject") {
    await auth.api.rejectInvitation({
      body: { invitationId },
      headers: request.headers,
    });
  }
  return redirect("/app");
}

export default function RouteComponent({
  loaderData,
}: Route.ComponentProps) {
  if (loaderData.needsAuth) {
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
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Invitation</CardTitle>
          <CardDescription>
            Would you like to accept or reject this invitation?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Rac.Form
            method="post"
            validationBehavior="aria"
            className="flex justify-end gap-6"
          >
            <Oui.Button type="submit" name="intent" value="accept">
              Accept
            </Oui.Button>
            <Oui.Button
              type="submit"
              name="intent"
              value="reject"
              variant="destructive"
            >
              Reject
            </Oui.Button>
          </Rac.Form>
        </CardContent>
      </Card>
    </div>
  );
}
