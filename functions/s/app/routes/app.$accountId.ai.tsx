import type { Route } from "./+types/app.$accountId.ai";
import * as Oui from "@workspace/oui";
import { SchemaEx } from "@workspace/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import { generateText } from "ai";
import { Effect, Schema } from "effect";
import OpenAI from "openai";
import * as Rac from "react-aria-components";
import { createWorkersAI } from "workers-ai-provider";
import * as ReactRouterEx from "~/lib/ReactRouterEx";

export const loader = ReactRouterEx.routeEffect(() =>
  Effect.gen(function* () {}),
);

export const action = ReactRouterEx.routeEffect(
  ({ request }: Route.ActionArgs) =>
    Effect.gen(function* () {
      const FormDataSchema = Schema.Struct({
        intent: Schema.Literal(
          "ai",
          "openai",
          "vercel",
          "gateway",
          "gateway1",
          "gateway2",
        ),
      });
      const formData = yield* SchemaEx.decodeRequestFormData({
        request,
        schema: FormDataSchema,
      });
      const env = (yield* ReactRouterEx.AppLoadContext).cloudflare.env;
      switch (formData.intent) {
        case "ai":
          const response = yield* Effect.tryPromise({
            try: () =>
              env.AI.run("@cf/meta/llama-3.2-1b-instruct", {
                prompt: "fee fi",
              }),
            catch: (unknown) => new Error(`AI request failed: ${unknown}`),
          });
          return { response };
        case "openai": {
          const openai = new OpenAI({
            apiKey: env.CF_WORKERS_AI_API_TOKEN,
            baseURL: `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/v1`,
          });

          const response = yield* Effect.tryPromise({
            try: () =>
              openai.chat.completions.create({
                messages: [{ role: "user", content: "fee fi" }],
                model: "@cf/meta/llama-3.1-8b-instruct",
              }),
            catch: (unknown) =>
              new Error(`OpenAI API request failed: ${unknown}`),
          });
          return { response };
        }
        case "vercel": {
          const workersai = createWorkersAI({ binding: env.AI });
          const response = yield* Effect.tryPromise({
            try: () =>
              generateText({
                model: workersai("@cf/meta/llama-3.1-8b-instruct"),
                prompt: "fee fi",
              }),
            catch: (unknown) =>
              new Error(`Vercel AI request failed: ${unknown}`),
          });
          return { response };
        }
        case "gateway": {
          const response = yield* Effect.tryPromise({
            try: () =>
              env.AI.run(
                "@cf/meta/llama-3.2-1b-instruct",
                {
                  prompt: "fee fi",
                },
                {
                  gateway: {
                    id: env.CF_AI_GATEWAY_ID,
                    skipCache: false,
                    cacheTtl: 3360,
                  },
                },
              ),
            catch: (unknown) => new Error(`AI request failed: ${unknown}`),
          });
          return { response };
        }
        case "gateway1": {
          const openai = new OpenAI({
            apiKey: env.CF_WORKERS_AI_API_TOKEN,
            baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CF_ACCOUNT_ID}/${env.CF_AI_GATEWAY_ID}/compat/chat/completions`,
            defaultHeaders: {
              "cf-aig-authorization": `Bearer ${env.CF_AI_GATEWAY_TOKEN}`,
            },
          });

          const response = yield* Effect.tryPromise({
            try: () =>
              openai.chat.completions.create({
                messages: [{ role: "user", content: "abacab" }],
                // model: "workers-ai/@cf/meta/llama-3.1-8b-instruct",
                model: "@cf/meta/llama-3.1-8b-instruct",
              }),
            catch: (unknown) =>
              new Error(`OpenAI API request failed: ${unknown}`),
          });
          return { response };
        }

        default:
          return yield* Effect.fail(
            new Error(`Invalid intent: ${formData.intent}`),
          );
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
            <Oui.Button
              type="submit"
              name="intent"
              value="vercel"
              variant="outline"
              className="justify-self-end"
            >
              Send Vercel Request
            </Oui.Button>
            <Oui.Button
              type="submit"
              name="intent"
              value="gateway"
              variant="outline"
              className="justify-self-end"
            >
              Send Gateway Request
            </Oui.Button>
            <Oui.Button
              type="submit"
              name="intent"
              value="gateway1"
              variant="outline"
              className="justify-self-end"
            >
              Send Gateway1 Request
            </Oui.Button>
            <Oui.Button
              type="submit"
              name="intent"
              value="gateway2"
              variant="outline"
              className="justify-self-end"
            >
              Send Gateway2 Request
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
