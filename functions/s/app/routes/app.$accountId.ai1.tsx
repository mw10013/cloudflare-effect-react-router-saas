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
import * as ReactRouterEx from "~/lib/ReactRouterEx";

export const loader = ReactRouterEx.routeEffect(() =>
  Effect.gen(function* () {}),
);

export default function RouteComponent({}: Route.ComponentProps) {
  const href = useHref("./api");
  const { messages, input, handleInputChange, handleSubmit, error } = useChat({
    api: href,
    initialMessages: [
      {
        id: "0",
        role: "system",
        content:
          "You are a highly loquacious, helpful AI assistant. Always provide detailed, friendly, and engaging responses, elaborating on topics and offering extra context, tips, or related information whenever possible.",
      },
      {
        id: "1",
        role: "user",
        content: "Hello, who are you?",
      },
      {
        id: "2",
        role: "assistant",
        content:
          "Hello there! It's a pleasure to meet you. I'm your AI assistant, designed to help you with a wide range of questions and tasks. Whether you're curious about technology, need help solving a problem, or just want to chat about interesting topics, I'm here to provide thorough and thoughtful answers. How can I assist you today?",
      },
      {
        id: "3",
        role: "user",
        content: "What can you do?",
      },
      {
        id: "4",
        role: "assistant",
        content:
          "I'm glad you asked! My capabilities are quite broad: I can answer factual questions, explain complex concepts in simple terms, help you brainstorm ideas, assist with writing or editing, and even offer tips on productivity or learning. If you have a specific topic in mind, feel free to ask—I'm always eager to dive into details and provide as much useful information as possible!",
      },
      {
        id: "5",
        role: "user",
        content: "Can you give me an example?",
      },
      {
        id: "6",
        role: "assistant",
        content:
          "Absolutely! For instance, if you asked me about the basics of quantum computing, I could explain the fundamental principles, discuss real-world applications, and even suggest resources for further reading. Or, if you're working on a project and need advice on best practices, I can provide step-by-step guidance and highlight common pitfalls to avoid. Whatever your curiosity, I'm here to help with detailed, engaging responses!",
      },
    ],
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

  // min-h-0 allows this flex item to shrink below its content size, preventing a flex-1 child from expanding the parent.
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-6">
      <div data-slot="message-container" className="flex-1 overflow-y-auto">
        {messages.map((message) => (
          <div
            data-slot="message"
            key={message.id}
            className="mb-4 whitespace-pre-wrap"
          >
            <span className="font-bold">
              {message.role.charAt(0).toUpperCase() +
                message.role.slice(1) +
                ": "}
            </span>
            {message.parts.map((part, i) => {
              switch (part.type) {
                case "text":
                  return <div key={`${message.id}-${i}`}>{part.text}</div>;
              }
            })}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          className="w-full rounded border border-zinc-300 p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
