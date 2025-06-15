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
import * as Rac from "react-aria-components";
import { useHref } from "react-router";
import * as ReactRouter from "~/lib/ReactRouter";

export const loader = ReactRouter.routeEffect(() =>
  Effect.gen(function* () {}),
);

export default function RouteComponent({
  loaderData,
  actionData,
}: Route.ComponentProps) {
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
