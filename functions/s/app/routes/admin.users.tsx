import type { Route } from "./+types/admin.users";
import { useState } from "react";
import * as Oui from "@workspace/oui";
import { SchemaEx } from "@workspace/shared";
import { Effect, Schema } from "effect";
import { redirect, useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";
import { UserIdFromString } from "~/lib/Domain";
import { IdentityMgr } from "~/lib/IdentityMgr";
import * as ReactRouterEx from "~/lib/ReactRouterEx";

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

export const action = ReactRouterEx.routeEffect(
  ({ request }: Route.ActionArgs) =>
    Effect.gen(function* () {
      const FormDataSchema = Schema.Union(
        Schema.Struct({
          intent: Schema.Literal("lock", "unlock", "soft_delete", "undelete"),
          userId: UserIdFromString,
        }),
        Schema.Struct({
          intent: Schema.Literal("update_note"),
          userId: UserIdFromString,
          note: Schema.String,
        }),
      );
      const formData = yield* SchemaEx.decodeRequestFormData({
        request,
        schema: FormDataSchema,
      });
      switch (formData.intent) {
        case "update_note":
          yield* IdentityMgr.updateUserNote({
            userId: formData.userId,
            note: formData.note,
          });
          break;
        case "lock":
          {
            const actingStafferId = yield* ReactRouterEx.AppLoadContext.pipe(
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
          {
            yield* IdentityMgr.unlockUser({ userId: formData.userId });
            const { session } = yield* ReactRouterEx.AppLoadContext;
            session.flash("toast", {
              title: "User unlocked",
              description: `User ${formData.userId} has been unlocked.`,
            });
          }
          break;
        case "soft_delete":
          yield* IdentityMgr.softDeleteUser({ userId: formData.userId });
          break;
        case "undelete":
          yield* IdentityMgr.undeleteUser({ userId: formData.userId });
          break;
        default:
          return yield* Effect.fail(new Error("Invalid intent"));
      }
    }),
);

function EditNoteDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  note: initialNote,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (note: string) => void;
  note: string;
}) {
  const [note, setNote] = useState(initialNote);

  const handleConfirm = () => {
    onConfirm(note);
    onOpenChange(false);
  };

  return (
    <Oui.DialogEx isOpen={isOpen} onOpenChange={onOpenChange}>
      <Oui.DialogHeader>
        <Oui.Heading slot="title">Edit Note</Oui.Heading>
      </Oui.DialogHeader>
      <div>
        <Oui.Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter note..."
          autoFocus
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleConfirm();
            }
          }}
        />
      </div>
      <Oui.DialogFooter>
        <Oui.Button
          variant="outline"
          slot="close"
          onPress={() => onOpenChange(false)}
        >
          Cancel
        </Oui.Button>
        <Oui.Button slot="close" onPress={handleConfirm}>
          Save
        </Oui.Button>
      </Oui.DialogFooter>
    </Oui.DialogEx>
  );
}

export default function RouteComponent({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const alertDialog = Oui.useDialogEx1Alert();
  const [editNoteDialog, setEditNoteDialog] = useState<{
    isOpen: boolean;
    userId?: number;
    note: string;
  }>({ isOpen: false, note: "" });

  const onAction = (
    intent: "lock" | "unlock" | "soft_delete" | "undelete" | "update_note",
    userId: number,
    note?: string,
  ) => {
    const formData = new FormData();
    formData.append("intent", intent);
    formData.append("userId", String(userId));
    if (intent === "update_note" && note !== undefined) {
      formData.append("note", note);
    }
    fetcher.submit(formData, { method: "post" });
  };

  return (
    <>
      <div className="mb-4">
        <Oui.SearchFieldEx
          aria-label="Filter by email"
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
                  <Oui.MenuItem
                    key="edit_note"
                    id="edit_note"
                    onAction={() => {
                      setEditNoteDialog({
                        isOpen: true,
                        userId: user.userId,
                        note: user.note,
                      });
                    }}
                  >
                    Edit Note
                  </Oui.MenuItem>
                  {user.lockedAt ? (
                    <Oui.MenuItem
                      key="unlock"
                      id="unlock"
                      onAction={() => onAction("unlock", user.userId)}
                    >
                      Unlock
                    </Oui.MenuItem>
                  ) : (
                    <Oui.MenuItem
                      key="lock"
                      id="lock"
                      onAction={() => onAction("lock", user.userId)}
                    >
                      Lock
                    </Oui.MenuItem>
                  )}
                  {user.deletedAt ? (
                    <Oui.MenuItem
                      key="undelete"
                      id="undelete"
                      onAction={() => onAction("undelete", user.userId)}
                    >
                      Undelete
                    </Oui.MenuItem>
                  ) : (
                    <Oui.MenuItem
                      key="soft_delete"
                      id="soft_delete"
                      onAction={async () => {
                        const confirmed = await alertDialog.show({
                          title: "Safe delete user?",
                          children:
                            "While you can undelete a user, all of its data cannot be restored. Account memberships will be permenently destroyed.",
                        });
                        if (confirmed) {
                          onAction("soft_delete", user.userId);
                        }
                      }}
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
        <Oui.ListBoxEx1Pagination selectedKeys={[loaderData.page]}>
          <Oui.ListBoxItemEx1Pagination
            id="prev"
            href={`/admin/users?page=${loaderData.page > 1 ? loaderData.page - 1 : 1}${loaderData.filter ? `&filter=${encodeURIComponent(loaderData.filter)}` : ""}`}
            isDisabled={loaderData.page <= 1}
          >
            Previous
          </Oui.ListBoxItemEx1Pagination>
          {Array.from({ length: loaderData.totalPages }, (_, i) => (
            <Oui.ListBoxItemEx1Pagination
              key={i + 1}
              id={i + 1}
              href={`/admin/users?page=${i + 1}${loaderData.filter ? `&filter=${encodeURIComponent(loaderData.filter)}` : ""}`}
            >
              {i + 1}
            </Oui.ListBoxItemEx1Pagination>
          ))}
          <Oui.ListBoxItemEx1Pagination
            id="next"
            href={`/admin/users?page=${loaderData.page < loaderData.totalPages ? loaderData.page + 1 : loaderData.totalPages}${loaderData.filter ? `&filter=${encodeURIComponent(loaderData.filter)}` : ""}`}
            isDisabled={loaderData.page >= loaderData.totalPages}
          >
            Next
          </Oui.ListBoxItemEx1Pagination>
        </Oui.ListBoxEx1Pagination>
      )}

      <EditNoteDialog
        key={editNoteDialog.userId}
        isOpen={editNoteDialog.isOpen}
        onOpenChange={(isOpen) =>
          setEditNoteDialog((prev) => ({ ...prev, isOpen }))
        }
        note={editNoteDialog.note}
        onConfirm={(note) => {
          if (editNoteDialog.userId !== undefined) {
            onAction("update_note", editNoteDialog.userId, note);
          }
        }}
      />
      <Oui.Button onPress={() => toast("My first toast")}>
        Render toast
      </Oui.Button>
    </>
  );
}
