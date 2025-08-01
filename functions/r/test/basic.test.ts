import {
  createExecutionContext,
  env,
  waitOnExecutionContext,
} from "cloudflare:test";

describe("basic test", () => {
  it("should pass", () => {
    expect(1 + 1).toBe(2);
  });

  it("should have env", () => {
    console.log({ env });
    expect(env).toBeDefined();
  });
});
