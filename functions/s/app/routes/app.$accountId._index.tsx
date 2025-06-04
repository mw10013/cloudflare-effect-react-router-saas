import type { Route } from "./+types/app.$accountId._index";
import * as Oui from "@workspace/oui";
import { SchemaEx } from "@workspace/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import { Effect, Schema } from "effect";
import * as Rac from "react-aria-components";
import { useSubmit } from "react-router";
import { AccountMemberId, AccountMemberIdFromString } from "~/lib/Domain";
import { IdentityMgr } from "~/lib/IdentityMgr";
import * as ReactRouter from "~/lib/ReactRouter";

export const loader = ReactRouter.routeEffect(({ context }) =>
  Effect.gen(function* () {
    const sessionUser = yield* Effect.fromNullable(
      context.get(ReactRouter.appLoadContext).session.get("sessionUser"),
    );
    return {
      sessionUser,
      accountMember: context.get(ReactRouter.appLoadContext).accountMember,
      invitations: yield* IdentityMgr.getInvitations(sessionUser),
    };
  }),
);

export const action = ReactRouter.routeEffect(({ request }: Route.ActionArgs) =>
  Effect.gen(function* () {
    const userId = yield* ReactRouter.AppLoadContext.pipe(
      Effect.flatMap((appLoadContext) =>
        Effect.fromNullable(appLoadContext.session.get("sessionUser")?.userId),
      ),
    );
    const FormDataSchema = Schema.Struct({
      intent: Schema.Literal("accept", "decline"),
      accountMemberId: AccountMemberIdFromString,
    });
    const formData = yield* SchemaEx.decodeRequestFormData({
      request,
      schema: FormDataSchema,
    });
    switch (formData.intent) {
      case "accept":
        yield* IdentityMgr.acceptInvitation({
          accountMemberId: formData.accountMemberId,
          userId,
        });
        break;
      case "decline":
        yield* IdentityMgr.declineInvitation({
          accountMemberId: formData.accountMemberId,
          userId,
        });
        break;
      default:
        return yield* Effect.fail(new Error("Invalid intent"));
    }
  }),
);

export default function RouteComponent({
  loaderData: { invitations, ...loaderData },
}: Route.ComponentProps) {
  const submit = useSubmit();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nativeEvent = event.nativeEvent;
    // https://developer.mozilla.org/en-US/docs/Web/API/SubmitEvent
    if (nativeEvent instanceof SubmitEvent) {
      const submitter = nativeEvent.submitter;
      if (
        submitter &&
        (submitter instanceof HTMLButtonElement ||
          submitter instanceof HTMLInputElement)
      ) {
        submit(submitter);
      } else {
        console.error(
          "Form submission did not originate from a recognized button element (submitter was not a button).",
        );
      }
    } else {
      console.error("Form submission event was not a SubmitEvent.");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invitations</CardTitle>
            <CardDescription>
              Invitations awaiting your response.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4">
              {invitations.map((m) => (
                <li
                  key={m.accountMemberId}
                  className="flex items-center justify-between gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex-grow">
                    <Rac.Link
                      href={`/app/${m.accountId}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {m.account.user.email}
                    </Rac.Link>
                  </div>
                  <div className="flex gap-2">
                    <Rac.Form onSubmit={handleFormSubmit} method="post">
                      <input
                        type="hidden"
                        name="accountMemberId"
                        value={m.accountMemberId}
                      />
                      <Oui.Button
                        type="submit"
                        name="intent"
                        value="accept"
                        variant="outline"
                        size="sm"
                      >
                        Accept
                      </Oui.Button>
                    </Rac.Form>
                    <Rac.Form onSubmit={handleFormSubmit} method="post">
                      <input
                        type="hidden"
                        name="accountMemberId"
                        value={m.accountMemberId}
                      />
                      <Oui.Button
                        type="submit"
                        name="intent"
                        value="decline"
                        variant="destructive"
                        size="sm"
                      >
                        Decline
                      </Oui.Button>
                    </Rac.Form>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <pre>{JSON.stringify({ loaderData }, null, 2)}</pre>
    </div>
  );
}
