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
import OpenAI from "openai";
import * as Rac from "react-aria-components";
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
    const [cfAccountId, workersAiApiToken, aiGatewayToken] = yield* Config.all([
      Config.nonEmptyString("CF_ACCOUNT_ID"),
      Config.nonEmptyString("CF_WORKERS_AI_API_TOKEN"),
      Config.nonEmptyString("CF_AI_GATEWAY_TOKEN"),
    ]);

    switch (formData.intent) {
      case "ai":
        const response = yield* Effect.tryPromise({
          try: () =>
            ai.run("@cf/meta/llama-3.2-1b-instruct", {
              prompt: "What is micro saas",
            }),
          catch: (unknown) => new Error(`AI request failed: ${unknown}`),
        });
        return { response };
      case "openai": {
        const openai = new OpenAI({
          apiKey: workersAiApiToken,
          baseURL: `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/v1`,
        });

        const response = yield* Effect.tryPromise({
          try: () =>
            openai.chat.completions.create({
              messages: [{ role: "user", content: "ping" }],
              model: "@cf/meta/llama-3.1-8b-instruct",
            }),
          catch: (unknown) =>
            new Error(`OpenAI API request failed: ${unknown}`),
        });

        return { response };
      }
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
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">AI</h1>
        <p className="text-muted-foreground text-sm"></p>
      </header>

      <Card className="w-fit">
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
