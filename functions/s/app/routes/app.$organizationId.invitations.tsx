import type { Route } from "./+types/app.$organizationId.invitations";
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
  if (!session) throw new Error("Missing session or active organization");
  return {
    invitations: await auth.api.listInvitations({
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
          .array(z.email({ error: "Please provide valid email addresses." }))
          .min(1, { error: "At least one email is required" }),
      ),
    role: Domain.MemberRole.extract(["member", "admin"], {
      error: "Role must be Member or Admin.",
    }),
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
  loaderData: { invitations },
  actionData,
}: Route.ComponentProps) {
  const canEdit = true;
  return (
    <div className="flex flex-col gap-8 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Invitations</h1>
        <p className="text-muted-foreground text-sm">
          Invite new members and manage your invitations.
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
            validationErrors={actionData?.validationErrors}
            className="grid gap-6"
          >
            <Oui.TextFieldEx
              name="emails"
              label="Email Addresses"
              type="text"
              placeholder="e.g., user1@example.com, user2@example.com"
              isDisabled={!canEdit}
            />
            <Oui.SelectEx
              name="role"
              label="Role"
              defaultSelectedKey={"member"}
              items={[
                { id: "member", name: "Member" },
                { id: "admin", name: "Admin" },
              ]}
            >
              {(item) => <Oui.ListBoxItem>{item.name}</Oui.ListBoxItem>}
            </Oui.SelectEx>
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
          <CardTitle>Invitations</CardTitle>
          <CardDescription>
            Review and manage invitations sent for this organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations && invitations.length > 0 ? (
            <ul className="divide-border divide-y">
              {invitations.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{inv.email}</span>
                    <span className="text-muted-foreground text-sm">
                      {inv.role} — {inv.status}
                    </span>
                    {inv.status === "pending" && (
                      <span className="text-muted-foreground text-xs">
                        Expires: {new Date(inv.expiresAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {inv.status === "pending" && (
                    <div>
                      <Rac.Form method="post">
                        <input
                          type="hidden"
                          name="invitationId"
                          value={inv.id}
                        />
                        <Oui.Button
                          type="submit"
                          name="intent"
                          value="cancel"
                          variant="outline"
                          size="sm"
                          aria-label={`Cancel invitation for ${inv.email}`}
                        >
                          Cancel
                        </Oui.Button>
                      </Rac.Form>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              No invitations have been sent for this organization yet.
            </p>
          )}
        </CardContent>
      </Card>
      <pre>{JSON.stringify({ invitations, actionData }, null, 2)}</pre>
    </div>
  );
}
