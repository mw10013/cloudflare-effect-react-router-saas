import type { Route } from "./+types/app.$organizationId.billing";
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

export async function loader({
  request,
  params: { organizationId },
  context,
}: Route.LoaderArgs) {
  const { auth } = context.get(appLoadContext);
  const subscriptions = await auth.api.listActiveSubscriptions({
    headers: request.headers,
    query: { referenceId: organizationId },
  });
  const activeSubscription = subscriptions.find(
    (v) => v.status === "active" || v.status === "trialing",
  );
  return { activeSubscription, subscriptions };
}

export async function action({
  request,
  context,
  params: { organizationId },
}: Route.ActionArgs) {
  const schema = z.discriminatedUnion("intent", [
    z.object({
      intent: z.literal("manage"),
    }),
    z.object({
      intent: z.literal("cancel"),
      subscriptionId: z.string().min(1, "Missing subscriptionId"),
    }),
  ]);
  const parseResult = schema.parse(
    Object.fromEntries(await request.formData()),
  );
  const { auth } = context.get(appLoadContext);
  switch (parseResult.intent) {
    case "manage": {
      const result = await auth.api.createBillingPortal({
        headers: request.headers,
        body: {
          referenceId: organizationId,
          returnUrl: `${new URL(request.url).origin}/app/${organizationId}/billing`,
        },
      });
      throw redirect(result.url);
    }
    case "cancel": {
      const result = await auth.api.cancelSubscription({
        headers: request.headers,
        body: {
          referenceId: organizationId,
          subscriptionId: parseResult.subscriptionId,
          returnUrl: `${new URL(request.url).origin}/app/${organizationId}/billing`,
        },
      });
      throw redirect(result.url);
    }
    default:
      void (parseResult satisfies never);
  }
  return null;
}

export default function RouteComponent({
  loaderData: { activeSubscription, subscriptions },
}: Route.ComponentProps) {
  return (
    <div className="flex flex-col gap-8 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground text-sm">
          Manage your organization's subscription and billing information.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>
            Manage your billing information and subscription settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeSubscription ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium capitalize">
                    {activeSubscription.plan} Plan
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Status: {activeSubscription.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Rac.Form method="post">
                    <Oui.Button
                      type="submit"
                      name="intent"
                      value="manage"
                      variant="outline"
                    >
                      Manage Billing
                    </Oui.Button>
                  </Rac.Form>
                  <Rac.Form method="post">
                    <input
                      type="hidden"
                      name="subscriptionId"
                      value={activeSubscription.id}
                    />
                    <Oui.Button
                      type="submit"
                      name="intent"
                      value="cancel"
                      variant="destructive"
                    >
                      Cancel Subscription
                    </Oui.Button>
                  </Rac.Form>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No active subscription for this organization.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
          <CardDescription>
            Current subscription information and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs">
            {JSON.stringify({ subscriptions }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
