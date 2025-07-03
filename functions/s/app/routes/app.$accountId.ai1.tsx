import type { KeyboardEvent } from "react";
import type { Route } from "./+types/app.$accountId.ai1";
import { useEffect, useLayoutEffect, useRef } from "react";
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
        content: "Laconic",
      },
    ],
  });

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Scrolls the new user prompt to the top of the view. A spacer div at the
  // end of the message list provides the necessary scroll height.
  useEffect(() => {
    const messagesLength = messages.length;
    const lastMessage = messages[messagesLength - 1];

    if (
      messagesLength > prevMessagesLengthRef.current &&
      lastMessage?.role === "user"
    ) {
      lastMessageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    prevMessagesLengthRef.current = messagesLength;
  }, [messages.length]);

  // Dynamically sizes a spacer div, allowing the last message to scroll to the
  // top of the view while preventing the user from scrolling past it entirely.
  // `useLayoutEffect` is used to calculate the spacer's height (container
  // height minus one line of text) and apply it synchronously before the browser
  // paints, which avoids a visual flicker.
  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    const spacerEl = spacerRef.current;

    if (container && spacerEl) {
      const observer = new ResizeObserver(() => {
        const containerHeight = container.clientHeight;
        const newSpacerHeight = Math.max(
          0,
          containerHeight - 40, // 40px = 1.5rem (line) + 1rem (margin)
        );
        spacerEl.style.height = `${newSpacerHeight}px`;
      });

      observer.observe(container);

      return () => observer.disconnect();
    }
  }, [messages.length]);

  // min-h-0 allows this flex item to shrink below its content size, preventing a flex-1 child from expanding the parent.
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-6">
      <div
        ref={messagesContainerRef}
        data-slot="message-container"
        className="flex-1 overflow-y-auto"
      >
        {messages.map((message, index) => (
          <div
            ref={index === messages.length - 1 ? lastMessageRef : null}
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
        <div ref={spacerRef} />
      </div>
      <form onSubmit={handleSubmit}>
        <Oui.TextArea
          name="prompt"
          value={input}
          placeholder="Prompt..."
          className="max-h-40 min-h-10 resize-none"
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
      </form>
    </div>
  );
}
