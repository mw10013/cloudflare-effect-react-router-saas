import { Storage } from "@cloudflare/actors/storage";
import { DurableObject } from "cloudflare:workers";

export class DomainDo extends DurableObject {
  readonly #storage: Storage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.#storage = new Storage(ctx.storage);
  }

  override async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    switch (url.pathname) {
      case "/status":
        return this.handleStatus();
      case "/data":
        if (method === "GET") {
          return this.handleGetData();
        } else if (method === "POST") {
          return this.handleSetData(await request.json());
        }
        break;
      default:
        return new Response("Not Found", { status: 404 });
    }

    return new Response("Method Not Allowed", { status: 405 });
  }

  ping(): string {
    return "pong";
  }

  high(): string {
    const result = this.#storage.sql<{ high: number }>`select 5 as high`;
    return String(result[0].high);
  }

  private async handleStatus(): Promise<Response> {
    const data = await this.ctx.storage.get("lastUpdated");
    return Response.json({
      status: "active",
      id: this.ctx.id.toString(),
      lastUpdated: data ?? null,
    });
  }

  private async handleGetData(): Promise<Response> {
    const data = await this.ctx.storage.get("domainData");
    return Response.json({ data: data ?? null });
  }

  private async handleSetData(data: unknown): Promise<Response> {
    await this.ctx.storage.put("domainData", data);
    await this.ctx.storage.put("lastUpdated", new Date().toISOString());

    return Response.json({
      success: true,
      message: "Data updated successfully",
    });
  }
}

// Simplified synchronous migration runner
export interface SQLMigration {
  idMonotonicInc: number;
  description: string;
  sql: string;
}

export class SimpleSQLMigrations {
  #lastMigrationId: number;

  constructor(
    storage: DurableObjectStorage,
    migrations: SQLMigration[],
    kvKey = "__sql_migrations_lastID",
  ) {
    // Get last migration ID synchronously
    this.#lastMigrationId = storage.kv.get<number>(kvKey) ?? -1;

    // Filter migrations to run (those with ID > lastId), then sort the filtered subset
    const migrationsToRun = migrations
      .filter((m) => m.idMonotonicInc > this.#lastMigrationId)
      .toSorted((a, b) => a.idMonotonicInc - b.idMonotonicInc);

    if (migrationsToRun.length > 0) {
      // Run migrations synchronously in a transaction
      storage.transactionSync(() => {
        migrationsToRun.forEach((m) => {
          storage.sql.exec(m.sql);
        });
        // Update last ID to the highest ID run
        const newLastId =
          migrationsToRun[migrationsToRun.length - 1].idMonotonicInc;
        storage.kv.put(kvKey, newLastId);
        this.#lastMigrationId = newLastId;
      });
    }
  }

  getLastMigrationId(): number {
    return this.#lastMigrationId;
  }
}
