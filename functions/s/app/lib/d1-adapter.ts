import type { CleanedWhere, CreateCustomAdapter } from "better-auth/adapters";
import type { Where } from "better-auth/types";
import { createAdapter } from "better-auth/adapters";

type CustomAdapter = ReturnType<CreateCustomAdapter>;

/**
 * Better Auth options allow you to specify model names and we do so to align with our
 * SQLite schema, which uses capitalized table names (e.g., 'User').
 * Better Auth adapter test harness hard-codes model names in lower-case (e.g., 'user').
 * Fortunately, the hard-coded model names are singular but we still need to handle the capitalization.
 *
 * Better Auth does not seem to serialize Date objects as text in where clauses when `supportsDates` is false.
 * We handle this by serializing Date objects to ISO strings in `where` processing.
 *
 * Better Auth with the Organization plugin does not seem to handle `activeOrganizationId` data transformation.
 * The Organization plugin works with `activeOrganizationId` as a string, but the SQLite schema has it typed as a number.
 * We handle this by transforming `activeOrganizationId` in the `customTransformOutput` function.
 */

const modelSpecificIdFeature = false;

type AdaptOptions = {
  model: string;
  select?: string[];
  where?: Where[];
};

function adapt({ model: rawModel, select, where }: AdaptOptions) {
  const model =
    rawModel[0] === rawModel[0].toLowerCase()
      ? rawModel[0].toUpperCase() + rawModel.slice(1)
      : rawModel;
  const modelId = modelSpecificIdFeature
    ? model[0].toLowerCase() + model.slice(1) + "Id"
    : "id";

  return {
    model,
    modelId,
    selectClause:
      select && select.length
        ? select.map((s) => (s === "id" ? modelId : s)).join(", ")
        : "*",
    ...adaptWhere({ where, modelId }),
  };
}

function adaptWhere({ where, modelId }: { where?: Where[]; modelId: string }): {
  whereClause?: string;
  whereValues: any[];
} {
  if (!where || where.length === 0)
    return { whereClause: undefined, whereValues: [] };
  const clauses: string[] = [];
  const whereValues: any[] = [];
  for (const w of where) {
    const op = w.operator || "eq";
    const field = modelSpecificIdFeature
      ? w.field === "id"
        ? modelId
        : w.field
      : w.field;
    let sql = "";
    switch (op) {
      case "eq":
        sql = `${field} = ?`;
        whereValues.push(serializeWhereValue(w.value));
        break;
      case "ne":
        sql = `${field} <> ?`;
        whereValues.push(serializeWhereValue(w.value));
        break;
      case "lt":
        sql = `${field} < ?`;
        whereValues.push(serializeWhereValue(w.value));
        break;
      case "lte":
        sql = `${field} <= ?`;
        whereValues.push(serializeWhereValue(w.value));
        break;
      case "gt":
        sql = `${field} > ?`;
        whereValues.push(serializeWhereValue(w.value));
        break;
      case "gte":
        sql = `${field} >= ?`;
        whereValues.push(serializeWhereValue(w.value));
        break;
      case "in":
        if (Array.isArray(w.value) && w.value.length > 0) {
          sql = `${field} in (${w.value.map(() => "?").join(",")})`;
          whereValues.push(...w.value.map(serializeWhereValue));
        } else {
          sql = "0"; // always false
        }
        break;
      case "contains":
        sql = `${field} like ?`;
        whereValues.push(`%${serializeWhereValue(w.value)}%`);
        break;
      case "starts_with":
        sql = `${field} like ?`;
        whereValues.push(`${serializeWhereValue(w.value)}%`);
        break;
      case "ends_with":
        sql = `${field} like ?`;
        whereValues.push(`%${serializeWhereValue(w.value)}`);
        break;
      default:
        throw new Error(`Unsupported where operator: ${op}`);
    }
    clauses.push(sql);
  }
  let whereClause = clauses[0];
  for (let i = 1; i < clauses.length; i++) {
    whereClause = `${whereClause} ${where[i].connector || "and"} ${clauses[i]}`;
  }
  return { whereClause, whereValues };
}

function serializeWhereValue(v: any) {
  if (v instanceof Date) return v.toISOString();
  return v;
}

export const d1Adapter = (db: D1Database) =>
  createAdapter({
    config: {
      adapterId: "d1-adapter",
      adapterName: "D1 Adapter",
      supportsNumericIds: true,
      supportsDates: false,
      supportsBooleans: false,
      disableIdGeneration: true,
      debugLogs: false,
      // debugLogs: {
      //   deleteMany: true,
      // },
      customTransformOutput: ({ field, data }) => {
        if (field === "activeOrganizationId" && typeof data === "number") {
          return String(data);
        }
        return data;
      },
    },
    adapter: () => {
      const create: CustomAdapter["create"] = async ({
        model,
        data,
        select,
      }) => {
        const adapted = adapt({ model, select });
        const keys = Object.keys(data);
        const values = keys.map((k) => data[k]);
        const placeholders = keys.map(() => "?").join(",");
        const sql = `insert into ${adapted.model} (${keys.join(
          ",",
        )}) values (${placeholders}) returning ${adapted.selectClause}`;
        const stmt = db.prepare(sql).bind(...values);
        const result = await stmt.first();
        if (!result) {
          throw new Error(`Failed to create record in ${model}`);
        }
        return result as typeof data;
      };

      const findOne: CustomAdapter["findOne"] = async ({
        model,
        where,
        select,
      }) => {
        const adapted = adapt({ model, select, where });
        const sql = `select ${adapted.selectClause} from ${adapted.model} ${adapted.whereClause ? `where ${adapted.whereClause}` : ""} limit 1`;
        const stmt = db.prepare(sql).bind(...adapted.whereValues);
        return await stmt.first();
      };

      const findMany: CustomAdapter["findMany"] = async ({
        model,
        where,
        limit,
        sortBy,
        offset,
      }) => {
        const adapted = adapt({ model, where });
        let sql = `select * from ${adapted.model}`;
        if (adapted.whereClause) sql += ` where ${adapted.whereClause}`;
        if (sortBy) sql += ` order by ${sortBy.field} ${sortBy.direction}`;
        sql += ` limit ${limit}`;
        if (offset) sql += ` offset ${offset}`;
        const stmt = db.prepare(sql).bind(...adapted.whereValues);
        const result = await stmt.run();
        return result.results as any[]; // D1 returns results in a different format
      };

      const update: CustomAdapter["update"] = async ({
        model,
        where,
        update,
      }) => {
        const adapted = adapt({ model, where });
        const set = Object.keys(update as object)
          .map((k) => `${k} = ?`)
          .join(",");
        const setValues = Object.values(update as object);
        const sql = `update ${adapted.model} set ${set} ${
          adapted.whereClause ? `where ${adapted.whereClause}` : ""
        } returning *`;
        const stmt = db.prepare(sql).bind(...setValues, ...adapted.whereValues);
        return await stmt.first();
      };

      const updateMany: CustomAdapter["updateMany"] = async ({
        model,
        where,
        update,
      }) => {
        const adapted = adapt({ model, where });
        const set = Object.keys(update as object)
          .map((k) => `${k} = ?`)
          .join(",");
        const setValues = Object.values(update as object);
        const sql = `update ${adapted.model} set ${set} ${adapted.whereClause ? `where ${adapted.whereClause}` : ""}`;
        const stmt = db.prepare(sql).bind(...setValues, ...adapted.whereValues);
        const result = await stmt.run();
        return result.meta.changes;
      };

      const del: CustomAdapter["delete"] = async ({ model, where }) => {
        const adapted = adapt({ model, where });
        const sql = `delete from ${adapted.model} ${adapted.whereClause ? `where ${adapted.whereClause}` : ""}`;
        const stmt = db.prepare(sql).bind(...adapted.whereValues);
        await stmt.run();
      };

      const deleteMany: CustomAdapter["deleteMany"] = async ({
        model,
        where,
      }) => {
        const adapted = adapt({ model, where });
        const sql = `delete from ${adapted.model} ${adapted.whereClause ? `where ${adapted.whereClause}` : ""}`;
        const stmt = db.prepare(sql).bind(...adapted.whereValues);
        const result = await stmt.run();
        return result.meta.changes;
      };

      const count: CustomAdapter["count"] = async ({ model, where }) => {
        const adapted = adapt({ model, where });
        let sql = `select count(*) as count from ${adapted.model} ${adapted.whereClause ? `where ${adapted.whereClause}` : ""}`;
        const stmt = db.prepare(sql).bind(...adapted.whereValues);
        const result = await stmt.first();
        if (!result) {
          throw new Error(`Failed to count records in ${model}`);
        }
        return result.count as number;
      };

      return {
        create,
        findOne,
        findMany,
        update,
        updateMany,
        delete: del,
        deleteMany,
        count,
      };
    },
  });
