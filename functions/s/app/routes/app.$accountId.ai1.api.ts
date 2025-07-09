import type { Route } from "./+types/app.$accountId.ai1.api";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { convertToModelMessages, streamText } from "ai";
import { Effect } from "effect";
import { z } from "zod/v4";
import * as ReactRouterEx from "~/lib/ReactRouterEx";

/**
 * Custom fetch that injects index:0 into tool_calls if missing in streamed OpenAI-compatible responses.
 *
 * Brittle: Relies on regex string replacement on streamed JSON, which can break if JSON is chunked, formatted differently, or if tool_calls structure changes. Does not parse JSON structurally and may corrupt or miss data if assumptions are violated.
 */
const patchedFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const response = await fetch(input, init);
  if (
    !response.headers.get("content-type")?.includes("text/event-stream") ||
    response.body == null
  )
    return response;
  const { readable, writable } = new TransformStream({
    transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk);
      if (text.includes('"tool_calls":')) {
        try {
          const patchedText = text.replace(
            /("tool_calls":\s*\[\s*\{)/g,
            '$1"index":0,',
          );
          controller.enqueue(new TextEncoder().encode(patchedText));
          return;
        } catch (err) {
          console.error("patchedFetch error", err);
        }
      }
      controller.enqueue(chunk);
    },
  });
  response.body.pipeTo(writable);
  return new Response(readable, response);
};

export const action = ReactRouterEx.routeEffect(
  ({ request }: Route.ActionArgs) =>
    Effect.gen(function* () {
      const env = (yield* ReactRouterEx.AppLoadContext).cloudflare.env;
      const { messages } = yield* Effect.tryPromise(
        () => request.json() as Promise<{ messages: any[] }>,
      );
      yield* Effect.log(JSON.stringify({ messages }, null, 2));
      const provider = createOpenAICompatible({
        name: "cf-ai-gateway-gemini",
        apiKey: env.GOOGLE_AI_STUDIO_API_KEY,
        baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CF_ACCOUNT_ID}/${env.CF_AI_GATEWAY_ID}/compat`,
        headers: {
          "cf-aig-authorization": `Bearer ${env.CF_AI_GATEWAY_TOKEN}`,
        },
        fetch: patchedFetch,
      });
      const result = streamText({
        // gemini with openai compat seems to have problems with markdown tables
        // model: provider("google-ai-studio/gemini-2.5-flash-lite-preview-06-17"),
        // model: provider("workers-ai/@cf/meta/llama-3.1-8b-instruct"),
        model: provider("google-ai-studio/gemini-2.0-flash"),
        system: "Laconic",
        messages: convertToModelMessages(messages),
        tools: {
          celsiusToFahrenheit: {
            description: "Converts celsius to fahrenheit",
            inputSchema: z.object({
              value: z.string().describe("The value in celsius"),
            }),
            execute: async ({ value }) => {
              const celsius = parseFloat(value);
              const fahrenheit = celsius * (9 / 5) + 32;
              return `${celsius}°C is ${fahrenheit.toFixed(2)}°F`;
            },
          },
        },
      });
      return result.toUIMessageStreamResponse();
    }),
);
