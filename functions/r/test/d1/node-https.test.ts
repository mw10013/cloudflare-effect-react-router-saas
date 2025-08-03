import { describe, expect, it } from "vitest";

let nodeHttpsWorks = false;
try {
  // Try to import and use node:https
  const https = await import("node:https");
  nodeHttpsWorks = typeof https.get === "function";
} catch (err) {
  nodeHttpsWorks = false;
}

describe("node:https availability", () => {
  it("should be available and have a get function", () => {
    expect(nodeHttpsWorks).toBe(true);
  });
});
