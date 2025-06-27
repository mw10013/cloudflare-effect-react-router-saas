import type { Route } from "./+types/app.$accountId.ai";
import { createOpenAI } from "@ai-sdk/openai";
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
          "gemini1",
          "gemini2",
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
            // OpenAI client automatically adds /chat/completions to the end of the baseURL
            baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CF_ACCOUNT_ID}/${env.CF_AI_GATEWAY_ID}/compat`,
            defaultHeaders: {
              "cf-aig-authorization": `Bearer ${env.CF_AI_GATEWAY_TOKEN}`,
            },
          });

          const response = yield* Effect.tryPromise({
            try: () =>
              openai.chat.completions.create({
                messages: [{ role: "user", content: "abacab" }],
                model: "workers-ai/@cf/meta/llama-3.1-8b-instruct",
              }),
            catch: (unknown) =>
              new Error(`OpenAI API request failed: ${unknown}`),
          });
          return { response };
        }
        case "gateway2": {
          const openai = createOpenAI({
            apiKey: env.CF_WORKERS_AI_API_TOKEN,
            // OpenAI client automatically adds /chat/completions to the end of the baseURL
            baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CF_ACCOUNT_ID}/${env.CF_AI_GATEWAY_ID}/compat`,
            headers: {
              "cf-aig-authorization": `Bearer ${env.CF_AI_GATEWAY_TOKEN}`,
            },
            compatibility: "strict", // strict mode, enable when using the OpenAI API
          });
          const response = yield* Effect.tryPromise({
            try: () =>
              generateText({
                model: openai("workers-ai/@cf/meta/llama-3.1-8b-instruct"),
                prompt: "fee fi",
              }),
            catch: (unknown) =>
              new Error(`Gateway2: Vercel AI request failed: ${unknown}`),
          });
          return { response };
        }
        case "gemini1": {
          const openai = new OpenAI({
            apiKey: env.GOOGLE_STUDIO_API_KEY,
            // OpenAI client automatically adds /chat/completions to the end of the baseURL
            baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CF_ACCOUNT_ID}/${env.CF_AI_GATEWAY_ID}/compat`,
            defaultHeaders: {
              "cf-aig-authorization": `Bearer ${env.CF_AI_GATEWAY_TOKEN}`,
            },
          });

          const response = yield* Effect.tryPromise({
            try: () =>
              openai.chat.completions.create({
                messages: [{ role: "user", content: "abacab" }],
                model: "google-ai-studio/gemini-2.0-flash",
              }),
            catch: (unknown) =>
              new Error(`Gemini1:OpenAI API request failed: ${unknown}`),
          });
          return { response };
        }
        case "gemini2": {
          const openai = createOpenAI({
            apiKey: env.GOOGLE_STUDIO_API_KEY,
            // OpenAI client automatically adds /chat/completions to the end of the baseURL
            // baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CF_ACCOUNT_ID}/${env.CF_AI_GATEWAY_ID}/compat`,
            baseURL: `${yield* Effect.tryPromise(() => env.AI.gateway(env.CF_AI_GATEWAY_ID).getUrl("compat"))}`,
            headers: {
              "cf-aig-authorization": `Bearer ${env.CF_AI_GATEWAY_TOKEN}`,
            },
            compatibility: "strict", // strict mode, enable when using the OpenAI API
          });
          const response = yield* Effect.tryPromise({
            try: () =>
              generateText({
                model: openai("google-ai-studio/gemini-2.0-flash"),
                prompt: "fee fi",
              }),
            catch: (unknown) =>
              new Error(`Gemini2: Vercel AI request failed: ${unknown}`),
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
            <Oui.Button
              type="submit"
              name="intent"
              value="gemini1"
              variant="outline"
              className="justify-self-end"
            >
              Send Gemini1 Request
            </Oui.Button>
            <Oui.Button
              type="submit"
              name="intent"
              value="gemini2"
              variant="outline"
              className="justify-self-end"
            >
              Send Gemini2 Request
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
