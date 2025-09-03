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

  const getUser = async ({ email }: { email: string }) => {
    const result = await d1
      .prepare(`select * from User where email = ?`)
      .bind(email)
      .first();
    console.log(`repository: getUser`, { result });
    return Domain.User.parse(result);
  };

  return {
    getUsers: async () => {
      const result = await d1.prepare(`select * from User`).run();
      console.log(`repository: getUsers`, { result, results: result.results });
      const users = Domain.User.array().parse(result.results);
      console.log(`repository: getUsers`, { users });
      return users;
    },
    deleteUser: async (email: string) => {
       // Get userId from email
      const userResult = await d1
        .prepare(`select userId from User where email = ?`)
        .bind(email)
        .first();
      if (!userResult) throw new Error(`User with email ${email} not found`);
      const userId = userResult.userId as number;

      // Find organizations where user is the only owner
      const orphanedOrgs = await d1
        .prepare(
          `
          select m.organizationId
          from Member m
          where m.userId = ? and m.role = 'owner'
          and not exists (
            select 1 from Member m2
            where m2.organizationId = m.organizationId
            and m2.userId != ? and m2.role = 'owner'
          )
        `,
        )
        .bind(userId, userId)
        .run();

      const statements = [];

      // Delete orphaned organizations
      for (const org of orphanedOrgs.results || []) {
        statements.push(
          d1
            .prepare(`delete from Organization where organizationId = ?`)
            .bind(org.organizationId),
        );
      }

      // Delete the user
      statements.push(
        d1.prepare(`delete from User where userId = ?`).bind(userId),
      );

      // Execute in batch
      await d1.batch(statements);
    },
  };
}
