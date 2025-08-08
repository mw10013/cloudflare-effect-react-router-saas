import type { Route } from "./+types/app.$accountId.ai1.api";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
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
        stopWhen: stepCountIs(3),
        tools: {
          weather: tool({
            description: "Get the weather in a location",
            inputSchema: z.object({
              location: z
                .string()
                .describe("The location to get the weather for"),
            }),
            execute: async ({ location }) => ({
              location,
              temperature: 72 + Math.floor(Math.random() * 21) - 10,
              unit: "fahrenheit",
            }),
          }),
          fahrenheitToCelsius: tool({
            description: "Converts fahrenheit to celsius",
            inputSchema: z.object({
              value: z.string().describe("The value in fahrenheit"),
            }),
            execute: async ({ value }) => {
              const fahrenheit = parseFloat(value);
              const celsius = (fahrenheit - 32) * (5 / 9);
              return `${fahrenheit}°F is ${celsius.toFixed(2)}°C`;
            },
          }),
        },
      });
      return result.toUIMessageStreamResponse();
    }),
);
