import type { Route } from "./+types/app.$organizationId.billing";
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
  return { subscriptions };
}

export default function RouteComponent({
  loaderData: { subscriptions },
}: Route.ComponentProps) {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Billing</h1>
      <pre>{JSON.stringify({ subscriptions }, null, 2)}</pre>
    </div>
  );
}
