import type { Route } from "./+types/admin.users";
import * as Oui from "@workspace/oui";
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
    <Oui.Table aria-label="Users">
      <Oui.TableHeader>
        <Oui.Column isRowHeader className="w-[80px]">
          userId
        </Oui.Column>
        <Oui.Column>email</Oui.Column>
        <Oui.Column>name</Oui.Column>
        <Oui.Column>userType</Oui.Column>
        <Oui.Column>note</Oui.Column>
        <Oui.Column>createdAt</Oui.Column>
        <Oui.Column>lockedAt</Oui.Column>
        <Oui.Column>deletedAt</Oui.Column>
        <Oui.Column className="w-10 text-right" aria-label="Actions">
          <span className="sr-only">Actions</span>
        </Oui.Column>
      </Oui.TableHeader>
      <Oui.TableBody items={loaderData?.users ?? []}>
        {(user) => (
          <Oui.Row id={user.userId}>
            <Oui.Cell className="font-mono">{user.userId}</Oui.Cell>
            <Oui.Cell>{user.email}</Oui.Cell>
            <Oui.Cell>{user.name}</Oui.Cell>
            <Oui.Cell>{user.userType}</Oui.Cell>
            <Oui.Cell>{user.note}</Oui.Cell>
            <Oui.Cell>
              {user.createdAt ? new Date(user.createdAt).toLocaleString() : ""}
            </Oui.Cell>
            <Oui.Cell>
              {user.lockedAt ? new Date(user.lockedAt).toLocaleString() : ""}
            </Oui.Cell>
            <Oui.Cell>
              {user.deletedAt ? new Date(user.deletedAt).toLocaleString() : ""}
            </Oui.Cell>
            <Oui.Cell className="text-right">
              <Oui.MenuEx
                triggerElement={
                  <Oui.Button variant="ghost" className="size-8 p-0">
                    <span className="sr-only">Open menu for {user.email}</span>⋮
                  </Oui.Button>
                }
              >
                <Oui.MenuItem id="lock">Lock</Oui.MenuItem>
                <Oui.MenuItem id="delete">Delete</Oui.MenuItem>
              </Oui.MenuEx>
            </Oui.Cell>
          </Oui.Row>
        )}
      </Oui.TableBody>
    </Oui.Table>
  );
}
