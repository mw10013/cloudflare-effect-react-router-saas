import type { Route } from "./+types/admin.users";
import * as Oui from "@workspace/oui";
import { SchemaEx } from "@workspace/shared";
import { Effect, Schema } from "effect";
import { useFetcher } from "react-router";
import { UserIdFromString } from "~/lib/Domain";
import { IdentityMgr } from "~/lib/IdentityMgr";
import * as ReactRouter from "~/lib/ReactRouter";

export const loader = ReactRouter.routeEffect(() =>
  IdentityMgr.getUsers().pipe(Effect.map((users) => ({ users }))),
);

export const action = ReactRouter.routeEffect(({ request }: Route.ActionArgs) =>
  Effect.gen(function* () {
    const FormDataSchema = Schema.Struct({
      intent: Schema.Literal("lock", "unlock", "delete", "undelete"),
      userId: UserIdFromString,
    });
    const formData = yield* SchemaEx.decodeRequestFormData({
      request,
      schema: FormDataSchema,
    });
    yield* Effect.log({ intent: formData.intent, userId: formData.userId });
    switch (formData.intent) {
      case "lock":
        yield* IdentityMgr.lockUser({ userId: formData.userId });
        break;
      case "unlock":
        yield* IdentityMgr.unlockUser({ userId: formData.userId });
        break;
      case "delete":
        yield* IdentityMgr.softDeleteUser({ userId: formData.userId });
        break;
      case "undelete":
        yield* IdentityMgr.undeleteUser({ userId: formData.userId });
        break;
      default:
        yield* Effect.fail(new Error("Invalid intent"));
        break;
    }
  }),
);

export default function RouteComponent({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const fetcher = useFetcher();
  const onAction = (
    intent: "lock" | "unlock" | "delete" | "undelete",
    userId: number,
  ) => {
    const formData = new FormData();
    formData.append("intent", intent);
    formData.append("userId", String(userId));
    fetcher.submit(formData, { method: "post" });
  };
  return (
    <Oui.Table aria-label="Users">
      <Oui.TableHeader>
        <Oui.Column isRowHeader className="w-[80px]">
          Id
        </Oui.Column>
        <Oui.Column>Email</Oui.Column>
        <Oui.Column>Name</Oui.Column>
        <Oui.Column>Type</Oui.Column>
        <Oui.Column>Note</Oui.Column>
        <Oui.Column>Created</Oui.Column>
        <Oui.Column>Locked</Oui.Column>
        <Oui.Column>Deleted</Oui.Column>
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
                {user.lockedAt ? (
                  <Oui.MenuItem
                    id="unlock"
                    onAction={() => onAction("unlock", user.userId)}
                  >
                    Unlock
                  </Oui.MenuItem>
                ) : (
                  <Oui.MenuItem
                    id="lock"
                    onAction={() => onAction("lock", user.userId)}
                  >
                    Lock
                  </Oui.MenuItem>
                )}
                {user.deletedAt ? (
                  <Oui.MenuItem
                    id="undelete"
                    onAction={() => onAction("undelete", user.userId)}
                  >
                    Undelete
                  </Oui.MenuItem>
                ) : (
                  <Oui.MenuItem
                    id="delete"
                    onAction={() => onAction("delete", user.userId)}
                  >
                    Delete
                  </Oui.MenuItem>
                )}
              </Oui.MenuEx>
            </Oui.Cell>
          </Oui.Row>
        )}
      </Oui.TableBody>
    </Oui.Table>
  );
}
