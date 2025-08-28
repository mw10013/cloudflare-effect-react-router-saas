import type { Route } from "./+types/_mkt.pricing";
import * as Oui from "@workspace/oui";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import * as Rac from "react-aria-components";
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
                  <input type="hidden" name="priceId" value={price.id} />
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
