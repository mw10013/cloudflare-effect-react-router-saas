import type { Route } from "./+types/app.$accountId.ai1";
import { useChat } from "@ai-sdk/react";
import * as Oui from "@workspace/oui";
import { ConfigEx, SchemaEx } from "@workspace/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card";
import { generateText, streamText } from "ai";
import { Config, ConfigError, Effect, Either, Schema } from "effect";
import OpenAI from "openai";
import * as Rac from "react-aria-components";
import { useHref } from "react-router";
import { createWorkersAI } from "workers-ai-provider";
import * as ReactRouter from "~/lib/ReactRouter";

export const loader = ReactRouter.routeEffect(() =>
  Effect.gen(function* () {}),
);

export const action = async ({ request, context }: Route.ActionArgs) => {
  const appLoadContext = context.get(ReactRouter.appLoadContext);
  const { messages }: any = await request.json();
  const ai = appLoadContext.cloudflare.env.AI;
  const workersai = createWorkersAI({ binding: ai });
  const result = streamText({
    model: workersai("@cf/meta/llama-3.1-8b-instruct"),
    messages,
  });
  const response = result.toDataStreamResponse();
  console.log("toDataStreamResponse:", {
    isInstanceOfResponse: response instanceof Response,
    response,
  });
  return response;
};

// export const action = ReactRouter.routeEffect(({ request }: Route.ActionArgs) =>
//   Effect.gen(function* () {
//     const { messages }: any = yield* Effect.tryPromise(() => request.json());
//     const ai = yield* ConfigEx.object("AI").pipe(
//       Config.mapOrFail((object) =>
//         "autorag" in object && typeof object.autorag === "function"
//           ? Either.right(object as Ai)
//           : Either.left(
//               ConfigError.InvalidData([], `Expected AI but received ${object}`),
//             ),
//       ),
//     );
//     const workersai = createWorkersAI({ binding: ai });
//     const result = streamText({
//       model: workersai("@cf/meta/llama-3.1-8b-instruct"),
//       messages,
//     });
//     yield* Effect.log({ messages, result });
//     return result.toDataStreamResponse();
//   }),
// );

export default function RouteComponent({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  // const href = useHref(".");
  const href = useHref("./api");
  const { messages, input, handleInputChange, handleSubmit, error } = useChat({
    api: href,
    onError: (err) => {
      console.error("useChat onError:", err);
    },
    onResponse: (res) => {
      console.log("useChat onResponse:", res);
    },
    onFinish: (message) => {
      console.log("useChat onFinish:", message);
    },
  });
  return (
    <div className="stretch mx-auto flex w-full max-w-md flex-col py-24">
      {messages.map((message) => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === "user" ? "User: " : "AI: "}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case "text":
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
            }
          })}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 mb-8 w-full max-w-md rounded border border-zinc-300 p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
      <pre>
        {JSON.stringify(
          {
            error,
            // href,
            messages,
            input,
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
