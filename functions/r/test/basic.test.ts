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

  // This will improve in the next major version of `@cloudflare/workers-types`,
  // but for now you'll need to do something like this to get a correctly-typed
  // `Request` to pass to `worker.fetch()`.
  const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

  it("dispatches fetch event", async () => {
    const request = new IncomingRequest("http://example.com");
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);
    console.log({ response });
    expect(response.status).toBe(200);
    // expect(await response.text()).toBe("👋 http://example.com");
  });
});
