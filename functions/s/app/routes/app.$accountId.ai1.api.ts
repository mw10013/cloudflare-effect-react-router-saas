import type { Route } from "./+types/app.$accountId.ai1.api";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { Effect } from "effect";
import * as ReactRouterEx from "~/lib/ReactRouterEx";

export const action = ReactRouterEx.routeEffect(
  ({ request }: Route.ActionArgs) =>
    Effect.gen(function* () {
      const env = (yield* ReactRouterEx.AppLoadContext).cloudflare.env;
      const { messages } = yield* Effect.tryPromise(
        () => request.json() as Promise<{ messages: any[] }>,
      );
      const openai = createOpenAI({
        apiKey: env.GOOGLE_STUDIO_API_KEY,
        // OpenAI client automatically adds /chat/completions to the end of the baseURL
        baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CF_ACCOUNT_ID}/${env.CF_AI_GATEWAY_ID}/compat`,
        headers: {
          "cf-aig-authorization": `Bearer ${env.CF_AI_GATEWAY_TOKEN}`,
        },
        compatibility: "strict", // strict mode, enable when using the OpenAI API
      });
      const result = streamText({
        model: openai("google-ai-studio/gemini-2.5-flash-lite-preview-06-17"),
        // model: openai("google-ai-studio/gemini-2.5-flash"),
        messages,
      });
      return result.toDataStreamResponse();
    }),
);

// export const action = ReactRouterEx.routeEffect(
//   ({ request }: Route.ActionArgs) =>
//     Effect.gen(function* () {
//       const env = (yield* ReactRouterEx.AppLoadContext).cloudflare.env;
//       const { messages } = yield* Effect.tryPromise(
//         () => request.json() as Promise<{ messages: any[] }>,
//       );
//       const openai = createOpenAI({
//         apiKey: env.CF_WORKERS_AI_API_TOKEN,
//         // OpenAI client automatically adds /chat/completions to the end of the baseURL
//         baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CF_ACCOUNT_ID}/${env.CF_AI_GATEWAY_ID}/compat`,
//         headers: {
//           "cf-aig-authorization": `Bearer ${env.CF_AI_GATEWAY_TOKEN}`,
//         },
//         compatibility: "strict", // strict mode, enable when using the OpenAI API
//       });
//       const result = streamText({
//         model: openai("workers-ai/@cf/meta/llama-3.1-8b-instruct"),
//         messages,
//       });
//       return result.toDataStreamResponse();
//     }),
// );
