import {
  createExecutionContext,
  env,
  waitOnExecutionContext,
} from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { loader } from "~/routes/home";
import worker from "./test-worker";

describe("basic", () => {
  it("should have env", () => {
    expect(env).toBeDefined();
  });

  const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

  it("dispatches fetch event", async () => {
    const request = new IncomingRequest("http://example.com");
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);
    expect(response.status).toBe(200);
  });

  it("home loader returns expected message", () => {
    const context = {
      cloudflare: { env },
    };
    const result = loader({ context });
    expect(result).toEqual({ message: env.VALUE_FROM_CLOUDFLARE });
  });
});
