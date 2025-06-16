import type { Route } from "./+types/app.$accountId.ai1.api";
import { streamText } from "ai";
import { Effect } from "effect";
import { createWorkersAI } from "workers-ai-provider";
import * as ReactRouter from "~/lib/ReactRouter";

export const action = ReactRouter.routeEffect(({ request }: Route.ActionArgs) =>
  Effect.gen(function* () {
    const { messages } = yield* Effect.tryPromise(
      () => request.json() as Promise<{ messages: any[] }>,
    );
    const workersai = createWorkersAI({
      binding: (yield* ReactRouter.AppLoadContext).cloudflare.env.AI,
    });
    const result = streamText({
      model: workersai("@cf/meta/llama-3.1-8b-instruct"),
      messages,
    });
    return result.toDataStreamResponse();
  }),
);
