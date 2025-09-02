import { env } from "cloudflare:workers";
import * as Domain from "~/lib/domain";

/**
 * The repository provides data access methods for the application's domain entities.
 *
 * Naming Conventions:
 * - `get*`: SELECT operations that retrieve entities
 * - `update*`: UPDATE operations that modify existing entities
 * - `upsert*`: INSERT OR UPDATE operations for creating or updating entities
 * - `create*`: INSERT operations for creating new entities
 * - `delete*`/`softDelete*`: DELETE operations (either physical or logical)
 *
 * Domain objects generally map 1:1 to sqlite tables and contain all columns.
 * SQL queries typically return JSON, especially for nested or composite domain objects.
 * Use select * for simple, single-table queries where all columns are needed.
 * Use explicit columns in json_object or nested queries to construct correct shapes.
 * No use of a.* or b.*; all multi-entity queries use explicit JSON construction.
 */

export function createRepository() {
  const d1 = env.D1;

  return {
    getUsers: async () => {
      const result = await d1.prepare(`select * from User`).run();
      const users = Domain.User.array().parse(result.results);
      console.log(`repository: getUsers`, { users });
      return users;
    },
  };
}
