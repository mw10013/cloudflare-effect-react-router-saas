import { env } from "cloudflare:test";

export class ExpectInvariantError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ExpectInvariantError.prototype);
  }
}

/**
 * Provide a condition and if that condition is falsy, throw an `ExpectInvariantError` with the provided message.
 *
 * Inspired by `@epicweb/invariant` which was inspired by `tiny-invariant`.
 *
 * @param condition - the condition to check
 * @param message - the optional message to throw
 *
 * @throws {ExpectInvariantError} if condition is falsy
 *
 * @see https://github.com/epicweb-dev/invariant
 * @see https://github.com/vitest-dev/vitest/issues/2883
 */
export function expectInvariant(
  condition: unknown,
  message?: string,
): asserts condition {
  if (!condition) {
    throw new ExpectInvariantError(message ?? "Expect invariant failed");
  }
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
