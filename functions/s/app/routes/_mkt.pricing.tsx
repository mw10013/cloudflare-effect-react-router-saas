import type { Route } from "./+types/_mkt.pricing";
import { invariant } from "@epic-web/invariant";
import * as Oui from "@workspace/oui";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import * as Rac from "react-aria-components";
import { redirect } from "react-router";
import * as z from "zod";
import { appLoadContext } from "~/lib/middleware";

export async function loader({ context }: Route.LoaderArgs) {
  const { stripe } = context.get(appLoadContext);
  const priceList = await stripe.prices.list({
    lookup_keys: ["basic", "pro"],
    expand: ["data.product"],
  });

  type Price = (typeof priceList.data)[number];
  type PriceWithLookupKey = Price & { lookup_key: string };
  const isPriceWithLookupKey = (p: Price): p is PriceWithLookupKey =>
    p.lookup_key !== null;
  const prices = priceList.data
    .filter(isPriceWithLookupKey)
    .sort((a, b) => a.lookup_key.localeCompare(b.lookup_key));
  invariant(prices.length > 1, `Not enough prices (${prices.length})`);
  return { prices };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { auth, session } = context.get(appLoadContext);
  if (!session) {
    return redirect("/login");
  }
  if (session.user.role !== "user")
    throw new Response("Forbidden", { status: 403 });
  const schema = z.object({
    plan: z.string().min(1, "Missing plan"),
  });
  const { plan } = schema.parse(Object.fromEntries(await request.formData()));

  const activeOrganizationId = session.session.activeOrganizationId;
  invariant(activeOrganizationId, "Missing activeOrganizationId");

  const subscriptions = await auth.api.listActiveSubscriptions({
    headers: request.headers,
    query: { referenceId: activeOrganizationId },
  });
  invariant(
    subscriptions.length <= 1,
    `Too many subscriptions (${subscriptions.length})`,
  );
  const subscriptionId =
    subscriptions.length === 1
      ? subscriptions[0].stripeSubscriptionId
      : undefined;
  console.log(`pricing`, { plan, subscriptionId });
  const { url, redirect: isRedirect } = await auth.api.upgradeSubscription({
    headers: request.headers,
    body: {
      plan,
      annual: false,
      referenceId: activeOrganizationId,
      subscriptionId,
      seats: 1,
      successUrl: "/app",
      cancelUrl: "/pricing",
      returnUrl: `/app/${activeOrganizationId}/billing`,
      disableRedirect: false,
    },
  });
  console.log(`pricing`, { isRedirect, url });
  invariant(isRedirect, "isRedirect is not true");
  invariant(url, "Missing url");
  return redirect(url);
}

export default function RouteComponent({
  loaderData: { prices },
}: Route.ComponentProps) {
  return (
    <div className="p-6">
      <div className="mx-auto grid max-w-xl gap-8 md:grid-cols-2">
        {prices.map((price) => {
          if (!price.unit_amount) return null;
          return (
            <Card key={price.id}>
              <CardHeader>
                <CardTitle className="capitalize">{price.lookup_key}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${price.unit_amount / 100}</p>
              </CardContent>
              <CardFooter className="justify-end">
                <Rac.Form method="post">
                  <input type="hidden" name="plan" value={price.lookup_key} />
                  <Oui.Button type="submit">Get Started</Oui.Button>
                </Rac.Form>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
