import { env } from "cloudflare:test";

export async function resetDb(resetFn?: (db: D1Database) => Promise<void>) {
  await env.D1.batch([
    ...["Verification", "Session"].map((table) =>
      env.D1.prepare(`delete from ${table}`),
    ),
    // Keep the admin account and user.
    env.D1.prepare(`delete from Account where id <> 1`),
    env.D1.prepare(`delete from User where id <> 1`),
  ]);
  if (resetFn) await resetFn(env.D1);
}
