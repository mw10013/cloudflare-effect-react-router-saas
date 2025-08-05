import { env } from "cloudflare:test";

export async function resetDb(resetFn?: (db: D1Database) => Promise<void>) {
  await env.D1.batch([
    ...["Verification", "Account", "Session", "User"].map((table) =>
      env.D1.prepare(`delete from ${table}`),
    ),
  ]);
  if (resetFn) await resetFn(env.D1);
}
