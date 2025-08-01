import { describe, expect, it } from "vitest";
import Worker from "../workers/app";

describe("Worker fetch function", () => {
  it("returns 200 status for basic request", async () => {
    const request = new Request("https://test.local/");
    const env = {};
    const ctx = {};
    // @ts-ignore: minimal test, ignore type mismatch for mock request
    const response = await Worker.fetch(request, env, ctx);
    expect(response).toBeDefined();
    expect(response.status).toBe(200);
  });
});
