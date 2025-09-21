import type { SQLMigration } from "../../workers/sql-schema-migrations";
import type { Env } from "./test-worker";
import { env, runInDurableObject } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { SQLSchemaMigrations } from "../../workers/sql-schema-migrations";
import { SQLMigrationsDO } from "./test-worker";

function makeM(state: DurableObjectState, migrations: SQLMigration[]) {
  return new SQLSchemaMigrations({
    storage: state.storage,
    migrations: migrations,
  });
}

declare module "cloudflare:test" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ProvidedEnv extends Env {}
}

describe("happy paths", () => {
  it("empty initial storage", async () => {
    // Check sending request directly to instance
    const id = env.SQL_MIGRATIONS_DO.idFromName("emptyDO");
    const stub = env.SQL_MIGRATIONS_DO.get(id);

    await runInDurableObject(
      stub,
      async (instance: SQLMigrationsDO, state: DurableObjectState) => {
        const m = makeM(state, [
          {
            idMonotonicInc: 1,
            description: "test default tables",
            sql: `SELECT * FROM sqlite_master;`,
          },
        ]);
        m.runAll();

        expect(state.storage.sql.databaseSize).toEqual(8192);
        return Promise.resolve();
      },
    );

    // Check direct access to instance fields and storage
    await runInDurableObject(
      stub,
      async (instance: SQLMigrationsDO, state: DurableObjectState) => {
        expect(await state.storage.get<number>("__sql_migrations_lastID")).toBe(
          1,
        );
      },
    );
  });

  it("multiple DDL", async () => {
    const id = env.SQL_MIGRATIONS_DO.idFromName("emptyDO");
    const stub = env.SQL_MIGRATIONS_DO.get(id);

    await runInDurableObject(
      stub,
      async (instance: SQLMigrationsDO, state: DurableObjectState) => {
        expect(instance).toBeInstanceOf(SQLMigrationsDO);

        const res = makeM(state, [
          {
            idMonotonicInc: 1,
            description: "tbl1",
            sql: `CREATE TABLE users(name TEXT PRIMARY KEY, age INTEGER);`,
          },
          {
            idMonotonicInc: 2,
            description: "tbl2",
            sql: `CREATE TABLE IF NOT EXISTS usersActivities (activityType TEXT, userName TEXT, PRIMARY KEY (userName, activityType));`,
          },
        ]).runAll();

        expect(res).toEqual({
          rowsRead: 2,
          rowsWritten: 6,
        });
        return Promise.resolve();
      },
    );
  });
});
