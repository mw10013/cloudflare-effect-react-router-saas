export interface SQLMigration {
  idMonotonicInc: number;
  description: string;
  sql?: string;
}

export interface SQLSchemaMigrationsConfig {
  storage: DurableObjectStorage;
  migrations: SQLMigration[];
  kvKey?: string;
}

export class SQLSchemaMigrations {
  #config: SQLSchemaMigrationsConfig;
  #migrations: SQLMigration[];
  #kvKey: string;
  #lastMigrationId: number;

  constructor(config: SQLSchemaMigrationsConfig) {
    this.#config = config;
    this.#kvKey = config.kvKey ?? "__sql_migrations_lastID";

    const migrations = [...config.migrations];
    migrations.sort((a, b) => a.idMonotonicInc - b.idMonotonicInc);
    const idSeen = new Set<number>();
    migrations.forEach((m) => {
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

    this.#migrations = migrations;

    this.#lastMigrationId =
      this.#config.storage.kv.get<number>(this.#kvKey) ?? -1;
  }

  /**
   * Checks if there are any migrations that have not been run yet.
   * @returns `true` if there are pending migrations, `false` otherwise.
   */
  hasMigrationsToRun(): boolean {
    if (!this.#migrations.length) {
      return false;
    }
    return (
      this.#lastMigrationId <
      this.#migrations[this.#migrations.length - 1].idMonotonicInc
    );
  }

  runAll(sqlGen?: (idMonotonicInc: number) => string): {
    rowsRead: number;
    rowsWritten: number;
  } {
    const result = {
      rowsRead: 0,
      rowsWritten: 0,
    };

    if (!this.hasMigrationsToRun()) {
      return result;
    }

    // Get pending migrations
    const migrationsToRun = this.#migrations.filter(
      (m) => m.idMonotonicInc > this.#lastMigrationId,
    );

    if (migrationsToRun.length > 0) {
      this.#config.storage.transactionSync(() => {
        migrationsToRun.forEach((m) => {
          const query = m.sql ?? sqlGen?.(m.idMonotonicInc);
          if (!query) {
            throw new Error(
              `migration with neither 'sql' nor 'sqlGen' provided: ${String(m.idMonotonicInc)}`,
            );
          }
          const cursor = this.#config.storage.sql.exec(query);
          // Consume the cursor for accurate rowsRead/rowsWritten tracking.
          cursor.toArray();

          result.rowsRead += cursor.rowsRead;
          result.rowsWritten += cursor.rowsWritten;
        });

        this.#config.storage.kv.put(
          this.#kvKey,
          migrationsToRun[migrationsToRun.length - 1].idMonotonicInc,
        );
      });
      // Only update the instance property after the transaction succeeds.
      // If updated inside the transaction and it fails, the instance property
      // would be ahead of storage, causing hasMigrationsToRun() to incorrectly
      // return false on subsequent calls.
      this.#lastMigrationId =
        migrationsToRun[migrationsToRun.length - 1].idMonotonicInc;
    }

    return result;
  }
}
