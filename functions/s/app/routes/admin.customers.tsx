import type { Route } from "./+types/admin.customers";
import { SchemaEx } from "@workspace/shared";
import { Effect, Schema } from "effect";
import { redirect } from "react-router";
import { IdentityMgr } from "~/lib/IdentityMgr";
import * as ReactRouterEx from "~/lib/ReactRouterEx";
import { Stripe } from "~/lib/Stripe";

export const loader = ReactRouterEx.routeEffect(
  ({ request }: Route.LoaderArgs) =>
    Effect.gen(function* () {
      const url = new URL(request.url);
      const pageParam = url.searchParams.get("page");
      const filterParam = url.searchParams.get("filter");

      const PageSchema = Schema.Union(
        Schema.Null,
        Schema.NumberFromString,
      ).pipe(
        Schema.transform(Schema.Number, {
          decode: (input) => (input === null ? 1 : input),
          encode: (output) => (output === 1 ? null : output),
        }),
        Schema.filter((n) => n >= 1 && n <= 10, {
          message: () => "Page must be between 1 and 10",
        }),
      );

      const FilterSchema = Schema.Union(Schema.Null, Schema.String).pipe(
        Schema.transform(Schema.String, {
          decode: (input) => input ?? "",
          encode: (output) => (output === "" ? null : output),
        }),
      );

      const page = yield* Schema.decodeUnknown(PageSchema)(pageParam);
      const filter = yield* Schema.decodeUnknown(FilterSchema)(filterParam);

      const pageSize = 5;
      const paginatedData = yield* IdentityMgr.getCustomersPaginated({
        page,
        pageSize,
        filter,
      });
      const totalPages = Math.ceil(paginatedData.count / pageSize);

      if (page > totalPages && totalPages > 0) {
        return yield* Effect.fail(redirect(`/admin/customers`));
      }

      return {
        customers: paginatedData.customers,
        count: paginatedData.count,
        page,
        pageSize,
        totalPages,
        filter,
      };
    }),
);

/*
Columns:
- userId
- email
- name
- note
- stripeCustomerId
- stripeSubscriptionId
- planName
- subscriptionStatus
- Actions
*/
export default function RouteComponent({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <div className="flex min-h-svh flex-col gap-2 p-6">
      <pre>{JSON.stringify(loaderData, null, 2)}</pre>
      <pre>{JSON.stringify(actionData, null, 2)}</pre>
    </div>
  );
}
