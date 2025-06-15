import type { Route } from "./+types/app.$accountId.ai1.api";
import { streamText } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import * as ReactRouter from "~/lib/ReactRouter";

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
  console.log("ai1.api: toDataStreamResponse:", {
    isInstanceOfResponse: response instanceof Response,
    response,
  });
  return response;
};
