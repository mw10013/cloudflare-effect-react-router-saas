import type { UIMessage } from "ai";
import type { Route } from "./+types/app.$accountId.ai1";
import React, { memo, useEffect, useLayoutEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import * as Oui from "@workspace/oui";
import { Effect } from "effect";
import equal from "fast-deep-equal";
import ReactMarkdown from "react-markdown";
import { useHref } from "react-router";
import remarkGfm from "remark-gfm";
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
        <Messages messages={messages} lastMessageRef={lastMessageRef} />
        <div ref={spacerRef} />
      </div>
      <form onSubmit={handleSubmit}>
        <Oui.TextArea
          autoFocus
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
      {/* <MarkdownTableHeaderTest /> */}
    </div>
  );
}

export function MarkdownTableHeaderTest() {
  const testChunks = [
    { label: "test chunk 1", value: "| Feature |" },
    { label: "test chunk 2", value: "| Feature | Description" },
    { label: "test chunk 3", value: "| Feature | Description |" },
  ];
  return (
    <div className="mt-4 rounded border bg-gray-50 p-2">
      {testChunks.map((chunk, i) => (
        <div key={i} className={i > 0 ? "mt-4" : undefined}>
          <div>Rendering {chunk.label}:</div>
          <pre className="text-xs text-gray-500">
            {JSON.stringify(chunk.value)}
          </pre>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {chunk.value}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );
}

function PureMessages({
  messages,
  lastMessageRef,
}: {
  messages: UIMessage[];
  lastMessageRef: React.Ref<HTMLDivElement>;
}) {
  return (
    <>
      {messages.map((message, index) => (
        <Message
          key={message.id}
          message={message}
          messageRef={index === messages.length - 1 ? lastMessageRef : null}
        />
      ))}
    </>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  return true;
});

function PureMessage({
  message,
  messageRef,
}: {
  message: UIMessage;
  messageRef: React.Ref<HTMLDivElement> | null;
}) {
  // console.log(JSON.stringify(message, null, 2));
  return (
    <div
      ref={messageRef}
      data-slot="message"
      className="mb-4 whitespace-pre-wrap"
    >
      <span className="font-bold">
        {message.role.charAt(0).toUpperCase() + message.role.slice(1) + ": "}
      </span>
      {/* {message.parts && message.parts.length > 0 ? (
        message.parts.map((part, index) => {
          if (part.type === "text") {
            return <Markdown text={part.text} key={index} />;
          }
          return null;
        })
      ) : (
        <pre>{JSON.stringify(message, null, 2)}</pre>
        // <Markdown text={message.content} />
      )} */}
      <pre>{JSON.stringify(message, null, 2)}</pre>
    </div>
  );
}

export const Message = memo(PureMessage, (prevProps, nextProps) =>
  equal(prevProps.message, nextProps.message),
);

export const Markdown = memo(
  ({ text }: { text: string }) => {
    // console.log("Rendering markdown chunk:", JSON.stringify(text));
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>;
  },
  (prevProps, nextProps) => prevProps.text === nextProps.text,
);
Markdown.displayName = "Markdown";
