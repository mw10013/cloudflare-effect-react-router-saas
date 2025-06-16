import type { Route } from "./+types/app.$accountId.ai1.api";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { Effect } from "effect";
import { createWorkersAI } from "workers-ai-provider";
import * as ReactRouter from "~/lib/ReactRouter";

export const action = ReactRouter.routeEffect(({ request }: Route.ActionArgs) =>
  Effect.gen(function* () {
    const { messages } = yield* Effect.tryPromise(
      () => request.json() as Promise<{ messages: any[] }>,
    );
    const workersai = createWorkersAI({
      binding: (yield* ReactRouter.AppLoadContext).cloudflare.env.AI,
    });
    const result = streamText({
      model: workersai("@cf/meta/llama-3.1-8b-instruct"),
      messages,
    });
    return result.toDataStreamResponse();
  }),
);

// export const action = ReactRouter.routeEffect(({ request }: Route.ActionArgs) =>
//   Effect.gen(function* () {
//     const env = (yield* ReactRouter.AppLoadContext).cloudflare.env;
//     const { messages } = yield* Effect.tryPromise(
//       () => request.json() as Promise<{ messages: any[] }>,
//     );
//     const openai = createOpenAI({
//       name: "workers-ai",
//       // modelId: "workers-ai/@cf/meta/llama-3.1-8b-instruct",
//       baseURL: ` https://gateway.ai.cloudflare.com/${env.CF_ACCOUNT_ID}/saas-ai-gateway/workers-ai/v1/chat/completions`,
//       apiKey: env.CF_WORKERS_AI_API_TOKEN,
//       compatibility: "strict", // strict mode, enable when using the OpenAI API
//       headers: {
//         "cf-aig-authorization": `Bearer ${env.CF_AI_GATEWAY_TOKEN}`,
//         // Authorization: `Bearer ${env.CF_AI_GATEWAY_TOKEN}`,
//       },
//     });
//     const result = streamText({
//       model: openai("workers-ai/@cf/meta/llama-3.1-8b-instruct"),
//       messages,
//     });
//     return result.toDataStreamResponse();
//   }),
// );
