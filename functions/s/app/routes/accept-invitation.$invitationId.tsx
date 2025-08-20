import type { Route } from "./+types/accept-invitation.$invitationId";
import * as Oui from "@workspace/oui";
import * as Rac from "react-aria-components";
import { redirect } from "react-router";
import * as z from "zod";
import { FormErrorAlert } from "~/components/FormAlert";
import { appLoadContext } from "~/lib/middleware";

export async function loader({
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
  const { intent } = parseResult.data;
  if (intent === "accept") {
    await auth.api.acceptInvitation({
      body: { invitationId },
      headers: request.headers,
    });
  } else if (intent === "reject") {
    await auth.api.rejectInvitation({
      body: { invitationId },
      headers: request.headers,
    });
  }
  return redirect("/app");
}

export default function RouteComponent({
  loaderData,
  actionData,
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
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Rac.Form
        method="post"
        validationBehavior="aria"
        validationErrors={actionData?.validationErrors}
        className="flex w-full max-w-sm flex-col gap-6"
      >
        <Oui.Text>Would you like to accept or reject this invitation?</Oui.Text>
        <FormErrorAlert formErrors={actionData?.formErrors} />
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
