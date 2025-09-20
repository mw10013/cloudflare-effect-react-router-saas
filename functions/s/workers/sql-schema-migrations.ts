export interface SQLMigration {
  idMonotonicInc: number;
  description: string;
  sql?: string;
}

export class SQLSchemaMigrations {
  #lastMigrationId: number;

  constructor(
    storage: DurableObjectStorage,
    migrations: SQLMigration[],
    options: {
      sqlGen?: (idMonotonicInc: number) => string;
      kvKey?: string;
    } = {},
  ) {
    const { sqlGen, kvKey = "__sql_migrations_lastID" } = options;
    // Sort migrations by ID to ensure monotonic order
    const sortedMigrations = [...migrations].toSorted(
      (a, b) => a.idMonotonicInc - b.idMonotonicInc,
    );

    // Validate IDs: no negatives, no duplicates
    const idSeen = new Set<number>();
    sortedMigrations.forEach((m) => {
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
    this.#lastMigrationId = storage.kv.get<number>(kvKey) ?? -1;

    // Filter to migrations to run (already sorted, so no need to sort again)
    const migrationsToRun = sortedMigrations.filter(
      (m) => m.idMonotonicInc > this.#lastMigrationId,
    );

    if (migrationsToRun.length > 0) {
      // Run migrations synchronously in a transaction
      storage.transactionSync(() => {
        migrationsToRun.forEach((m) => {
          const query = m.sql ?? sqlGen?.(m.idMonotonicInc);
          if (!query) {
            throw new Error(
              `migration with neither 'sql' nor 'sqlGen' provided: ${String(m.idMonotonicInc)}`,
            );
          }
          storage.sql.exec(query);
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
