import type { Route } from "./+types/admin.users";
import { useState } from "react";
import * as Oui from "@workspace/oui";
import { SchemaEx } from "@workspace/shared";
import { Effect, Schema } from "effect";
import { redirect, useFetcher, useLocation, useNavigate } from "react-router";
import { UserIdFromString } from "~/lib/Domain";
import { IdentityMgr } from "~/lib/IdentityMgr";
import * as ReactRouter from "~/lib/ReactRouter";

export const loader = ReactRouter.routeEffect(({ request }: Route.LoaderArgs) =>
  Effect.gen(function* () {
    const url = new URL(request.url);
    const pageParam = url.searchParams.get("page");
    const filterParam = url.searchParams.get("filter");

    const PageSchema = Schema.Union(Schema.Null, Schema.NumberFromString).pipe(
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
    const paginatedData = yield* IdentityMgr.getUsersPaginated({
      page,
      pageSize,
      filter,
    });
    const totalPages = Math.ceil(paginatedData.count / pageSize);

    if (page > totalPages && totalPages > 0) {
      return yield* Effect.fail(redirect(`/admin/users`));
    }

    return {
      users: paginatedData.users,
      count: paginatedData.count,
      page,
      pageSize,
      totalPages,
      filter,
    };
  }),
);

export const action = ReactRouter.routeEffect(({ request }: Route.ActionArgs) =>
  Effect.gen(function* () {
    const FormDataSchema = Schema.Struct({
      intent: Schema.Literal("lock", "unlock", "soft_delete", "undelete"),
      userId: UserIdFromString,
    });
    const formData = yield* SchemaEx.decodeRequestFormData({
      request,
      schema: FormDataSchema,
    });
    yield* Effect.log({ intent: formData.intent, userId: formData.userId });
    switch (formData.intent) {
      case "lock":
        {
          const actingStafferId = yield* ReactRouter.AppLoadContext.pipe(
            Effect.flatMap((appLoadContext) =>
              Effect.fromNullable(
                appLoadContext.session.get("sessionUser")?.userId,
              ),
            ),
          );
          yield* IdentityMgr.lockUser({
            userId: formData.userId,
            actingStafferId,
          });
        }
        break;
      case "unlock":
        yield* IdentityMgr.unlockUser({ userId: formData.userId });
        break;
      case "soft_delete":
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
  const navigate = useNavigate();
  const location = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onAction = (
    intent: "lock" | "unlock" | "soft_delete" | "undelete",
    userId: number,
  ) => {
    const formData = new FormData();
    formData.append("intent", intent);
    formData.append("userId", String(userId));
    fetcher.submit(formData, { method: "post" });
  };

  return (
    <>
      <div className="mb-4">
        <Oui.SearchFieldEx
          placeholder="Filter by email..."
          defaultValue={loaderData?.filter ?? ""}
          name="filter"
          onSubmit={(filter: string) => {
            navigate(
              `./?filter=${encodeURIComponent(filter)}&page=${loaderData?.page ?? 1}`,
            );
          }}
        />
      </div>

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
                {user.createdAt
                  ? new Intl.DateTimeFormat("en-CA").format(
                      new Date(user.createdAt),
                    )
                  : ""}
              </Oui.Cell>
              <Oui.Cell>
                {user.lockedAt
                  ? new Intl.DateTimeFormat("en-CA").format(
                      new Date(user.lockedAt),
                    )
                  : ""}
              </Oui.Cell>
              <Oui.Cell>
                {user.deletedAt
                  ? new Intl.DateTimeFormat("en-CA").format(
                      new Date(user.deletedAt),
                    )
                  : ""}
              </Oui.Cell>
              <Oui.Cell className="text-right">
                <Oui.MenuEx
                  triggerElement={
                    <Oui.Button variant="ghost" className="size-8 p-0">
                      <span className="sr-only">
                        Open menu for {user.email}
                      </span>
                      ⋮
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
                      id="soft_delete"
                      onAction={() => onAction("soft_delete", user.userId)}
                    >
                      Soft Delete
                    </Oui.MenuItem>
                  )}
                </Oui.MenuEx>
              </Oui.Cell>
            </Oui.Row>
          )}
        </Oui.TableBody>
      </Oui.Table>

      {loaderData && loaderData.totalPages > 1 && (
        <Oui.ListBoxEx1 selectedKeys={[loaderData.page]}>
          <Oui.ListBoxItemEx1
            id="prev"
            href={`/admin/users?page=${loaderData.page > 1 ? loaderData.page - 1 : 1}${loaderData.filter ? `&filter=${encodeURIComponent(loaderData.filter)}` : ""}`}
            isDisabled={loaderData.page <= 1}
          >
            Previous
          </Oui.ListBoxItemEx1>
          {Array.from({ length: loaderData.totalPages }, (_, i) => (
            <Oui.ListBoxItemEx1
              key={i + 1}
              id={i + 1}
              href={`/admin/users?page=${i + 1}${loaderData.filter ? `&filter=${encodeURIComponent(loaderData.filter)}` : ""}`}
            >
              {i + 1}
            </Oui.ListBoxItemEx1>
          ))}
          <Oui.ListBoxItemEx1
            id="next"
            href={`/admin/users?page=${loaderData.page < loaderData.totalPages ? loaderData.page + 1 : loaderData.totalPages}${loaderData.filter ? `&filter=${encodeURIComponent(loaderData.filter)}` : ""}`}
            isDisabled={loaderData.page >= loaderData.totalPages}
          >
            Next
          </Oui.ListBoxItemEx1>
        </Oui.ListBoxEx1>
      )}

      {/* <pre>{JSON.stringify(loaderData, null, 2)}</pre> */}

      <Oui.Button variant="outline" onPress={() => setIsDialogOpen(true)}>
        Test Alert Dialog
      </Oui.Button>

      <Oui.DialogEx1
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        role="alertdialog"
      >
        <Oui.DialogHeader>
          <Oui.Heading variant="alert" slot="title">
            Are you absolutely sure?
          </Oui.Heading>
          <Oui.DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </Oui.DialogDescription>
        </Oui.DialogHeader>
        <Oui.DialogFooter>
          <Oui.Button
            variant="outline"
            slot="close"
            autoFocus
            onPress={() => setIsDialogOpen(false)}
          >
            Cancel
          </Oui.Button>
          <Oui.Button slot="close" onPress={() => setIsDialogOpen(false)}>
            Continue
          </Oui.Button>
        </Oui.DialogFooter>
      </Oui.DialogEx1>
    </>
  );
}
