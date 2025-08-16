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

function adapt({ model: rawModel, select }: AdaptOptions) {
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
  };
}

function adaptWhere({ where, modelId }: { where?: Where[]; modelId: string }) {
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
    adapter: ({ schema }) => {
      // Workaround: better-auth does not serialize Date objects in where clauses when supportsDates is false
      const serializeValue = (v: any) =>
        v instanceof Date ? v.toISOString() : v;
      const whereToSql = (where?: Where[]) => {
        if (!where || where.length === 0) return { clause: "", values: [] };
        const clauses: string[] = [];
        const values: any[] = [];
        for (let i = 0; i < where.length; i++) {
          const w = where[i];
          const op = w.operator || "eq";
          let sql = "";
          switch (op) {
            case "eq":
              sql = `${w.field} = ?`;
              values.push(serializeValue(w.value));
              break;
            case "ne":
              sql = `${w.field} <> ?`;
              values.push(serializeValue(w.value));
              break;
            case "lt":
              sql = `${w.field} < ?`;
              values.push(serializeValue(w.value));
              break;
            case "lte":
              sql = `${w.field} <= ?`;
              values.push(serializeValue(w.value));
              break;
            case "gt":
              sql = `${w.field} > ?`;
              values.push(serializeValue(w.value));
              break;
            case "gte":
              sql = `${w.field} >= ?`;
              values.push(serializeValue(w.value));
              break;
            case "in":
              if (Array.isArray(w.value) && w.value.length > 0) {
                sql = `${w.field} in (${w.value.map(() => "?").join(",")})`;
                values.push(...w.value.map(serializeValue));
              } else {
                sql = "0"; // always false
              }
              break;
            case "contains":
              sql = `${w.field} like ?`;
              values.push(`%${serializeValue(w.value)}%`);
              break;
            case "starts_with":
              sql = `${w.field} like ?`;
              values.push(`${serializeValue(w.value)}%`);
              break;
            case "ends_with":
              sql = `${w.field} like ?`;
              values.push(`%${serializeValue(w.value)}`);
              break;
            default:
              throw new Error(`Unsupported where operator: ${op}`);
          }
          clauses.push(sql);
        }
        // connectors: default to 'and', but support 'or' if specified
        let clause = "";
        if (clauses.length > 0) {
          clause = clauses[0];
          for (let i = 1; i < clauses.length; i++) {
            const connector = (where[i].connector || "AND").toLowerCase();
            clause = `${clause} ${connector} ${clauses[i]}`;
          }
        }
        return { clause, values };
      };

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
        const adapted = adapt({ model, select });
        const { clause, values } = whereToSql(where);
        const sql = `select ${adapted.selectClause} from ${adapted.model} ${clause ? `where ${clause}` : ""} limit 1`;
        const stmt = db.prepare(sql).bind(...values);
        return await stmt.first();
      };

      const findMany: CustomAdapter["findMany"] = async ({
        model,
        where,
        limit,
        sortBy,
        offset,
      }) => {
        const adapted = adapt({ model });
        let sql = `select * from ${adapted.model}`;
        const params: any[] = [];
        if (where && where.length) {
          const { clause, values } = whereToSql(where);
          sql += ` where ${clause}`;
          params.push(...values);
        }
        if (sortBy) sql += ` order by ${sortBy.field} ${sortBy.direction}`;
        if (limit) sql += ` limit ${limit}`;
        if (offset) sql += ` offset ${offset}`;
        const stmt = db.prepare(sql).bind(...params);
        const result = await stmt.run();
        return result.results as any[]; // D1 returns results in a different format
      };

      const update: CustomAdapter["update"] = async ({
        model,
        where,
        update,
      }) => {
        const adapted = adapt({ model });
        const set = Object.keys(update as object)
          .map((k) => `${k} = ?`)
          .join(",");
        const setValues = Object.values(update as object);
        const { clause, values } = whereToSql(where);
        const sql = `update ${adapted.model} set ${set}${
          clause ? ` where ${clause}` : ""
        } returning *`;
        const stmt = db.prepare(sql).bind(...setValues, ...values);
        return await stmt.first();
      };

      const updateMany: CustomAdapter["updateMany"] = async ({
        model,
        where,
        update,
      }) => {
        const adapted = adapt({ model });
        const set = Object.keys(update as object)
          .map((k) => `${k} = ?`)
          .join(",");
        const setValues = Object.values(update as object);
        const { clause, values } = whereToSql(where);
        const sql = `update ${adapted.model} set ${set}${clause ? ` where ${clause}` : ""}`;
        const stmt = db.prepare(sql).bind(...setValues, ...values);
        const result = await stmt.run();
        return result.meta.changes;
      };

      const del: CustomAdapter["delete"] = async ({ model, where }) => {
        const adapted = adapt({ model });
        const { clause, values } = whereToSql(where);
        const sql = `delete from ${adapted.model}${clause ? ` where ${clause}` : ""}`;
        const stmt = db.prepare(sql).bind(...values);
        await stmt.run();
      };

      const deleteMany: CustomAdapter["deleteMany"] = async ({
        model,
        where,
      }) => {
        const adapted = adapt({ model });
        const { clause, values } = whereToSql(where);
        // console.log("deleteMany", { model, where, clause, values });
        const sql = `delete from ${adapted.model} ${clause ? `where ${clause}` : ""}`;
        const stmt = db.prepare(sql).bind(...values);
        const result = await stmt.run();
        return result.meta.changes;
      };

      const count: CustomAdapter["count"] = async ({ model, where }) => {
        const adapted = adapt({ model });
        let sql = `select count(*) as count from ${adapted.model}`;
        const params = [];
        if (where && where.length) {
          const { clause, values } = whereToSql(where);
          sql += ` where ${clause}`;
          params.push(...values);
        }
        const stmt = db.prepare(sql).bind(...params);
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
