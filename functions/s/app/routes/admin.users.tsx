import type { Route } from "./+types/admin.users";
import { SchemaEx } from "@workspace/shared";
import { Effect, Schema } from "effect";
import { IdentityMgr } from "~/lib/IdentityMgr";
import * as ReactRouter from "~/lib/ReactRouter";

export const loader = ReactRouter.routeEffect(() =>
  IdentityMgr.getUsers().pipe(Effect.map((users) => ({ users }))),
);

// const FormDataSchema = Schema.Union(
//   Schema.Struct({
//     intent: Schema.Literal("seed"),
//   }),
//   Schema.Struct({
//     intent: Schema.Literal("sync_stripe_data", "customer_subscription"),
//     customerId: Schema.NonEmptyString,
//   }),
// );

// export const action = ReactRouter.routeEffect(({ request }: Route.ActionArgs) =>
//   Effect.gen(function* () {
//     const formData = yield* SchemaEx.decodeRequestFormData({
//       request,
//       schema: FormDataSchema,
//     });
//     let message: string | undefined;
//     if (formData.intent === "seed") {
//       yield* Stripe.seed();
//       message = "Seeded";
//     }
//     return {
//       message,
//       formData,
//     };
//   }).pipe(SchemaEx.catchValidationError),
// );

export default function RouteComponent({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <>
      <pre>{JSON.stringify(loaderData, null, 2)}</pre>
      <pre>{JSON.stringify(actionData, null, 2)}</pre>
    </>
  );
}
