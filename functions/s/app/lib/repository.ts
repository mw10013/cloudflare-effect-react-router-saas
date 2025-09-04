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

  const getUser = async ({ email }: { email: Domain.User["email"] }) => {
    const result = await d1
      .prepare(`select * from User where email = ?`)
      .bind(email)
      .first();
    return Domain.User.nullable().parse(result);
  };

  return {
    getUser,
    getUsers: async () => {
      const result = await d1.prepare(`select * from User`).run();
      return Domain.User.array().parse(result.results);
    },

    /**
     * Hard delete a user by email.
     * Intended for testing only.
     *
     * Also deletes all the organizations where user is the sole owner.
     *
     * @returns number of users deleted (0 or 1)
     */
    deleteUser: async ({ email }: { email: Domain.User["email"] }) => {
      const user = await getUser({ email });
      if (!user) return 0;
      if (user.role === "admin") throw new Error("Cannot delete admin users");

      const results = await d1.batch([
        d1
          .prepare(
            `
with t as (
  select m.organizationId
  from Member m
  where m.userId = ?1 and m.role = 'owner'
  and not exists (
    select 1 from Member m1
    where m1.organizationId = m.organizationId
    and m1.userId != ?1 and m1.role = 'owner'
  )
)
delete from Organization where organizationId in (select organizationId from t)
`,
          )
          .bind(user.userId),
        d1
          .prepare(
            `delete from User where userId = ? and role <> 'admin' returning *`,
          )
          .bind(user.userId),
      ]);
      return results[1].results.length;
    },
  };
}
