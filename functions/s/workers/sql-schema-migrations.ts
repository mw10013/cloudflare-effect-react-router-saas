export interface SQLMigration {
  idMonotonicInc: number;
  description: string;
  sql?: string;
}

export class SQLSchemaMigrations {
  #storage: DurableObjectStorage;
  #sortedMigrations: SQLMigration[];
  #kvKey: string;
  #lastMigrationId: number;

  constructor(
    storage: DurableObjectStorage,
    migrations: SQLMigration[],
    kvKey = "__sql_migrations_lastID",
  ) {
    this.#storage = storage;
    this.#kvKey = kvKey;
    // Sort migrations by ID to ensure monotonic order
    this.#sortedMigrations = [...migrations].toSorted(
      (a, b) => a.idMonotonicInc - b.idMonotonicInc,
    );

    // Validate IDs: no negatives, no duplicates
    const idSeen = new Set<number>();
    this.#sortedMigrations.forEach((m) => {
      if (m.idMonotonicInc < 0) {
        throw new Error(
          `Migration ID cannot be negative: ${String(m.idMonotonicInc)}`,
        );
      }
      if (idSeen.has(m.idMonotonicInc)) {
        throw new Error(
          `Duplicate migration ID detected: ${String(m.idMonotonicInc)}`,
        );
      }
      idSeen.add(m.idMonotonicInc);
    });

    // Get last migration ID synchronously
    this.#lastMigrationId = this.#storage.kv.get<number>(this.#kvKey) ?? -1;
  }

  runAll(sqlGen?: (idMonotonicInc: number) => string): void {
    // Filter to migrations to run (already sorted, so no need to sort again)
    const migrationsToRun = this.#sortedMigrations.filter(
      (m) => m.idMonotonicInc > this.#lastMigrationId,
    );

    if (migrationsToRun.length > 0) {
      // Run migrations synchronously in a transaction
      this.#storage.transactionSync(() => {
        migrationsToRun.forEach((m) => {
          const query = m.sql ?? sqlGen?.(m.idMonotonicInc);
          if (!query) {
            throw new Error(
              `migration with neither 'sql' nor 'sqlGen' provided: ${String(m.idMonotonicInc)}`,
            );
          }
          this.#storage.sql.exec(query);
        });
        // Update last ID to the highest ID run
        const newLastId =
          migrationsToRun[migrationsToRun.length - 1].idMonotonicInc;
        this.#storage.kv.put(this.#kvKey, newLastId);
        this.#lastMigrationId = newLastId;
      });
    }
  }

  getLastMigrationId(): number {
    return this.#lastMigrationId;
  }
}
