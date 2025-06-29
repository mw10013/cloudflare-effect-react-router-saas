import type { Message } from "@ai-sdk/ui-utils";
import type { Schedule } from "agents";
import type {
  DataStreamWriter,
  StreamTextOnFinishCallback,
  ToolExecutionOptions,
  ToolSet,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { formatDataStreamPart } from "@ai-sdk/ui-utils";
import { getCurrentAgent } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import { unstable_getSchedulePrompt } from "agents/schedule";
import {
  convertToCoreMessages,
  createDataStreamResponse,
  generateId,
  streamText,
  tool,
} from "ai";
import { env } from "cloudflare:workers";
import { z } from "zod";

// Approval string to be shared across frontend and backend
export const APPROVAL = {
  YES: "Yes, confirmed.",
  NO: "No, denied.",
} as const;

const getLocalTime = tool({
  description: "get the local time for a specified location",
  parameters: z.object({ location: z.string() }),
  execute: async ({ location }) => {
    console.log(`Getting local time for ${location}`);
    return "10am";
  },
});

export const tools = {
  getLocalTime,
};

/**
 * Implementation of confirmation-required tools
 * This object contains the actual logic for tools that need human approval
 * Each function here corresponds to a tool above that doesn't have an execute function
 * NOTE: keys below should match toolsRequiringConfirmation in app.tsx
 */
export const executions = {
  // getWeatherInformation: async ({ city }: { city: string }) => {
  //   console.log(`Getting weather information for ${city}`);
  //   return `The weather in ${city} is sunny`;
  // },
};

function isValidToolName<K extends PropertyKey, T extends object>(
  key: K,
  obj: T,
): key is K & keyof T {
  return key in obj;
}

/**
 * Processes tool invocations where human input is required, executing tools when authorized.
 *
 * @param options - The function options
 * @param options.tools - Map of tool names to Tool instances that may expose execute functions
 * @param options.dataStream - Data stream for sending results back to the client
 * @param options.messages - Array of messages to process
 * @param executionFunctions - Map of tool names to execute functions
 * @returns Promise resolving to the processed messages
 */
export async function processToolCalls<
  Tools extends ToolSet,
  ExecutableTools extends {
    // biome-ignore lint/complexity/noBannedTypes: it's fine
    [Tool in keyof Tools as Tools[Tool] extends { execute: Function }
      ? never
      : Tool]: Tools[Tool];
  },
>({
  dataStream,
  messages,
  executions,
}: {
  tools: Tools; // used for type inference
  dataStream: DataStreamWriter;
  messages: Message[];
  executions: {
    [K in keyof Tools & keyof ExecutableTools]?: (
      args: z.infer<ExecutableTools[K]["parameters"]>,
      context: ToolExecutionOptions,
    ) => Promise<unknown>;
  };
}): Promise<Message[]> {
  const lastMessage = messages[messages.length - 1];
  const parts = lastMessage.parts;
  if (!parts) return messages;

  const processedParts = await Promise.all(
    parts.map(async (part) => {
      // Only process tool invocations parts
      if (part.type !== "tool-invocation") return part;

      const { toolInvocation } = part;
      const toolName = toolInvocation.toolName;

      // Only continue if we have an execute function for the tool (meaning it requires confirmation) and it's in a 'result' state
      if (!(toolName in executions) || toolInvocation.state !== "result")
        return part;

      let result: unknown;

      if (toolInvocation.result === APPROVAL.YES) {
        // Get the tool and check if the tool has an execute function.
        if (
          !isValidToolName(toolName, executions) ||
          toolInvocation.state !== "result"
        ) {
          return part;
        }

        const toolInstance = executions[toolName];
        if (toolInstance) {
          result = await toolInstance(toolInvocation.args, {
            messages: convertToCoreMessages(messages),
            toolCallId: toolInvocation.toolCallId,
          });
        } else {
          result = "Error: No execute function found on tool";
        }
      } else if (toolInvocation.result === APPROVAL.NO) {
        result = "Error: User denied access to tool execution";
      } else {
        // For any unhandled responses, return the original part.
        return part;
      }

      // Forward updated tool result to the client.
      dataStream.write(
        formatDataStreamPart("tool_result", {
          toolCallId: toolInvocation.toolCallId,
          result,
        }),
      );

      // Return updated toolInvocation with the actual result.
      return {
        ...part,
        toolInvocation: {
          ...toolInvocation,
          result,
        },
      };
    }),
  );

  // Finally return the processed messages
  return [...messages.slice(0, -1), { ...lastMessage, parts: processedParts }];
}

/**
 * A custom fetch implementation that intercepts streaming responses from an OpenAI-compatible API
 * and patches the tool_calls chunks to include the missing 'index' property.
 * This is a workaround for providers that do not adhere to the exact same response format as OpenAI,
 * which can cause validation errors in the AI SDK.
 *
 * @param input - The request info.
 * @param init - The request initialization options.
 * @returns A promise that resolves to a Response object.
 */
async function patchingFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, init);

  if (
    !response.headers.get("content-type")?.includes("text/event-stream") ||
    response.body == null
  ) {
    return response;
  }

  const { readable, writable } = new TransformStream({
    transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk);
      //
      // The AI SDK expects an `index` property on each tool_calls chunk, but some providers
      // do not include it. This is a workaround to add the index property to the chunk.
      //
      // See: https://sdk.vercel.ai/docs/guides/providers/openai-compatible-providers#custom-metadata-extraction
      //
      // The AI SDK's OpenAI provider will throw a type validation error if the index is missing.
      //
      // NOTE: This is a fragile workaround that assumes the AI will only ever return a
      // single tool call. The regex is designed to inject a missing `index` property
      // only for the *first* object in the `tool_calls` array. It will fail if the
      // provider returns multiple tool calls and omits the `index` on subsequent ones.
      if (text.includes('"tool_calls":')) {
        try {
          const patchedText = text.replace(
            /("tool_calls":\s*\[\s*\{)/g,
            '$1"index":0,',
          );
          controller.enqueue(new TextEncoder().encode(patchedText));
          return;
        } catch (e) {
          // ignore the error and fall through to the default behavior
        }
      }

      controller.enqueue(chunk);
    },
  });

  response.body.pipeTo(writable);

  return new Response(readable, response);
}

export class Chat extends AIChatAgent<Env> {
  /**
   * Handles incoming chat messages and manages the response stream
   * @param onFinish - Callback function executed when streaming completes
   */

  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    _options?: { abortSignal?: AbortSignal },
  ) {
    const openai = createOpenAI({
      apiKey: env.GOOGLE_AI_STUDIO_API_KEY,
      // OpenAI client automatically adds /chat/completions to the end of the baseURL
      baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CF_ACCOUNT_ID}/${env.CF_AI_GATEWAY_ID}/compat`,
      headers: {
        "cf-aig-authorization": `Bearer ${env.CF_AI_GATEWAY_TOKEN}`,
      },
      fetch: patchingFetch,
    });

    // const mcpConnection = await this.mcp.connect(
    //   "https://path-to-mcp-server/sse"
    // );

    // Collect all tools, including MCP tools
    const allTools = {
      ...tools,
      ...this.mcp.unstable_getAITools(),
    };

    // Create a streaming response that handles both text and tool outputs
    const dataStreamResponse = createDataStreamResponse({
      execute: async (dataStream) => {
        // Process any pending tool calls from previous messages
        // This handles human-in-the-loop confirmations for tools
        const processedMessages = await processToolCalls({
          messages: this.messages,
          dataStream,
          tools: allTools,
          executions,
        });

        const result = streamText({
          model: openai("google-ai-studio/gemini-2.5-flash-lite-preview-06-17"),
          // model: openai("google-ai-studio/gemini-2.5-flash"),
          system: `You are a helpful assistant that can do various tasks... 

${unstable_getSchedulePrompt({ date: new Date() })}

If the user asks to schedule a task, use the schedule tool to schedule the task.
`,
          messages: processedMessages,
          tools: allTools,
          onFinish: async (args) => {
            onFinish(
              args as Parameters<StreamTextOnFinishCallback<ToolSet>>[0],
            );
            // await this.mcp.closeConnection(mcpConnection.id);
          },
          onError: (error) => {
            console.error("Error while streaming:", error);
          },
          maxSteps: 10,
        });

        // Merge the AI response stream with tool execution outputs
        result.mergeIntoDataStream(dataStream);
      },
    });

    return dataStreamResponse;
  }
  async executeTask(description: string, _task: Schedule<string>) {
    await this.saveMessages([
      ...this.messages,
      {
        id: generateId(),
        role: "user",
        content: `Running scheduled task: ${description}`,
        createdAt: new Date(),
      },
    ]);
  }

  async ping() {
    return "pong";
  }
}

/**
 * Worker entry point that routes incoming requests to the appropriate handler
 */
// export default {
//   async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
//     const url = new URL(request.url);

//     if (url.pathname === "/check-open-ai-key") {
//       // const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
//       const hasOpenAIKey = !!process.env.GOOGLE_AI_STUDIO_API_KEY;
//       return Response.json({
//         success: hasOpenAIKey,
//       });
//     }
//     return (
//       // Route the request to our agent or return 404 if not found
//       (await routeAgentRequest(request, env)) ||
//       new Response("Not found", { status: 404 })
//     );
//   },
// } satisfies ExportedHandler<Env>;

/**
 * Local time tool that executes automatically
 * Since it includes an execute function, it will run without user confirmation
 * This is suitable for low-risk operations that don't need oversight
 */
