import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("d1", () => {
  it("select * from User returns 0 results", async () => {
    const result = await env.D1.prepare("select * from User").run();
    console.log(result);
    expect(result.results.length).toBe(0);
  });

  it("insert a User", async () => {
    const stmt = env.D1.prepare(
      "insert into User (name, email, emailVerified) values (?, ?, ?)",
    ).bind("Test User", "test@example.com", 0);
    const result = await stmt.run();
    console.log(result);
    expect(result.success).toBe(true);
    expect(result.meta.changes).toBe(1);

    const result1 = await env.D1.prepare("select * from User").run();
    console.log(result1);
  });

  it("select * from User returns 1 result", async () => {
    const result = await env.D1.prepare("select * from User").run();
    console.log(result);
    // expect(results.length).toBe(1);
    // expect(results[0].name).toBe("Test User");
    // expect(results[0].email).toBe("test@example.com");
  });
});
