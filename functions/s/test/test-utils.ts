import { env } from "cloudflare:test";
import { expect } from "vitest";

/**
 * @see https://github.com/vitest-dev/vitest/issues/2883
 */
export function expectToBeDefined<T>(value?: T): asserts value is NonNullable<T> {
  expect(value).toBeDefined()
}

export function expectToBe<T>(value?: unknown, compareValue?: T): asserts value is T {
  expect(value).toBe(compareValue)
}

export function expectInstanceOf<T>(value: unknown, constructor: new (...args: any[]) => T): asserts value is T {
  expect(value).toBeInstanceOf(constructor)
}

export async function resetDb(resetFn?: (db: D1Database) => Promise<void>) {
  await env.D1.batch([
    // Delete from referencing tables first to avoid FK constraint errors
    ...["Session", "Member", "Invitation", "Verification", "Organization"].map(
      (table) => env.D1.prepare(`delete from ${table}`),
    ),
    // Keep the admin in account and user.
    env.D1.prepare(`delete from Account where accountId <> 1`),
    env.D1.prepare(`delete from User where userId <> 1`),
  ]);
  if (resetFn) await resetFn(env.D1);
}
