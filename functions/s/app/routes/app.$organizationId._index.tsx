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
import { useFetcher } from "react-router";
import { appLoadContext } from "~/lib/middleware";

export async function loader({ request, context }: Route.LoaderArgs) {
  const MIN_TTL_MS = 5 * 60 * 1000;
  const { auth, session } = context.get(appLoadContext);
  invariant(session, "Missing session");
  const now = Date.now();
  return {
    invitations: (
      await auth.api.listUserInvitations({
        headers: request.headers,
        query: { email: session.user.email },
      })
    ).filter(
      (v) =>
        v.status === "pending" && v.expiresAt.getTime() - now >= MIN_TTL_MS,
    ),
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  invariant(intent === "accept" || intent === "reject", "Invalid intent");
  const invitationId = formData.get("invitationId");
  invariant(
    typeof invitationId === "string" && invitationId.length > 0,
    "Missing invitationId",
  );
  const { auth } = context.get(appLoadContext);
  if (intent === "accept")
    await auth.api.acceptInvitation({
      headers: request.headers,
      body: { invitationId },
    });
  else
    await auth.api.rejectInvitation({
      headers: request.headers,
      body: { invitationId },
    });
  return null;
}

const expiresIn = (expiresAt: Date): string => {
  const diff = expiresAt.getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const m = Math.floor(diff / 60000);
  if (m < 1) return "in <1m";
  if (m < 60) return `in ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `in ${h}h`;
  const d = Math.floor(h / 24);
  return `in ${d}d`;
};

function InvitationItem({
  invitation,
}: {
  invitation: Route.ComponentProps["loaderData"]["invitations"][number];
}) {
  const fetcher = useFetcher();
  const disabled = fetcher.state !== "idle";
  return (
    // <li className="flex items-center justify-between gap-4 border-b pb-4 last:border-b-0 last:pb-0">
    <li className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
      <div className="flex-grow text-sm">
        <div>Inviter ID: {invitation.inviterId}</div>
        <div>Organization ID: {invitation.organizationId}</div>
        <div>Role: {invitation.role}</div>
        <div>Expires: {expiresIn(invitation.expiresAt)}</div>
      </div>
      <fetcher.Form method="post" className="flex gap-2">
        <input type="hidden" name="invitationId" value={invitation.id} />
        <Oui.Button
          type="submit"
          name="intent"
          value="accept"
          variant="outline"
          size="sm"
          isDisabled={disabled}
        >
          Accept
        </Oui.Button>
        <Oui.Button
          type="submit"
          name="intent"
          value="reject"
          variant="destructive"
          size="sm"
          isDisabled={disabled}
        >
          Reject
        </Oui.Button>
      </fetcher.Form>
    </li>
  );
}

export default function RouteComponent({
  loaderData: { invitations },
}: Route.ComponentProps) {
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
            {/* <ul className="flex flex-col gap-4"> */}
            <ul className="divide-y flex flex-col">
              {invitations.map((invitation) => (
                <InvitationItem key={invitation.id} invitation={invitation} />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <pre>{JSON.stringify({ invitations }, null, 2)}</pre>
    </div>
  );
}
