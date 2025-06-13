import type { Route } from "./+types/app.$accountId.ai";
import * as Oui from "@workspace/oui";
import { ConfigEx, SchemaEx } from "@workspace/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import { Config, ConfigError, Effect, Either, Schema } from "effect";
import * as Rac from "react-aria-components";
import { InviteError } from "~/lib/IdentityMgr";
import * as ReactRouter from "~/lib/ReactRouter";

export const loader = ReactRouter.routeEffect(() =>
  Effect.gen(function* () {}),
);

export const action = ReactRouter.routeEffect(({ request }: Route.ActionArgs) =>
  Effect.gen(function* () {
    const FormDataSchema = Schema.Struct({
      intent: Schema.Literal("ai", "openai"),
    });
    const formData = yield* SchemaEx.decodeRequestFormData({
      request,
      schema: FormDataSchema,
    });
    const ai = yield* ConfigEx.object("AI").pipe(
      Config.mapOrFail((object) =>
        "autorag" in object && typeof object.autorag === "function"
          ? Either.right(object as Ai)
          : Either.left(
              ConfigError.InvalidData([], `Expected AI but received ${object}`),
            ),
      ),
    );

    switch (formData.intent) {
      case "ai":
        const response = yield* Effect.tryPromise(() =>
          ai.run("@cf/meta/llama-3.2-1b-instruct", {
            prompt: "What is micro saas",
          }),
        );
        return { response: JSON.stringify(response) };
      case "openai":
        return { response: "OpenAI request sent" };
      default:
        yield* Effect.fail(new Error("Invalid intent"));
        break;
    }
  }).pipe(SchemaEx.catchValidationError),
);

export default function RouteComponent({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">AI</h1>
        <p className="text-muted-foreground text-sm"></p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Prompt</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <Rac.Form
            method="post"
            className="grid gap-6"
            validationErrors={
              actionData && "validationErrors" in actionData
                ? actionData.validationErrors
                : undefined
            }
          >
            {/* <Oui.TextFieldEx
              name="emails"
              label="Email Addresses"
              type="text"
              placeholder="e.g., user1@example.com, user2@example.com"
            /> */}
            <Oui.Button
              type="submit"
              name="intent"
              value="ai"
              variant="outline"
              className="justify-self-end"
            >
              Send AI Request
            </Oui.Button>
            <Oui.Button
              type="submit"
              name="intent"
              value="openai"
              variant="outline"
              className="justify-self-end"
            >
              Send OpenAI Request
            </Oui.Button>
          </Rac.Form>
        </CardContent>
      </Card>

      <pre>
        {JSON.stringify(
          {
            loaderData,
            actionData,
          },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
