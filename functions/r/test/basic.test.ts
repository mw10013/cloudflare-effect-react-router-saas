import {
  createExecutionContext,
  env,
  waitOnExecutionContext,
} from "cloudflare:test";
import { describe, expect, it } from "vitest";
import worker from "./test-worker";

describe("basic test", () => {
  it("should pass", () => {
    expect(1 + 1).toBe(2);
  });

  it("should have env", () => {
    console.log({ env });
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
});
