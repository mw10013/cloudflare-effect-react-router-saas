import type { Route } from "./+types/_mkt.pricing";
import { appLoadContext } from "~/lib/middleware";

export async function loader({ context }: Route.LoaderArgs) {
  const { stripe } = context.get(appLoadContext);
  const priceList = await stripe.prices.list({
    lookup_keys: ["basic", "pro"],
    expand: ["data.product"],
  });
  const prices = priceList.data.sort((a, b) =>
    a.lookup_key && b.lookup_key ? a.lookup_key.localeCompare(b.lookup_key) : 0,
  );
  return { prices };
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>Pricing</h1>
      <pre>{JSON.stringify(loaderData.prices, null, 2)}</pre>
    </div>
  );
}
