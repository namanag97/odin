/**
 * Repository for data_models
 * Source: 15_data_model.sql
 */

import { Database } from "bun:sqlite";
import type { DataModels, DataModelsInsert, DataModelsUpdate } from "../types/data-models";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "data_models";

const SELECT_BY_ID = "SELECT * FROM data_models WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM data_models WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM data_models WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM data_models`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: DataModelsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.data_pool_id !== undefined) {
    columns.push("data_pool_id");
    values.push(data.data_pool_id);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.model_type !== undefined) {
    columns.push("model_type");
    values.push(data.model_type);
    placeholders.push("?");
  }
  if (data.activity_table_id !== undefined) {
    columns.push("activity_table_id");
    values.push(data.activity_table_id);
    placeholders.push("?");
  }
  if (data.case_table_id !== undefined) {
    columns.push("case_table_id");
    values.push(data.case_table_id);
    placeholders.push("?");
  }
  if (data.case_column !== undefined) {
    columns.push("case_column");
    values.push(data.case_column);
    placeholders.push("?");
  }
  if (data.activity_column !== undefined) {
    columns.push("activity_column");
    values.push(data.activity_column);
    placeholders.push("?");
  }
  if (data.timestamp_column !== undefined) {
    columns.push("timestamp_column");
    values.push(data.timestamp_column);
    placeholders.push("?");
  }
  if (data.sorting_column !== undefined) {
    columns.push("sorting_column");
    values.push(data.sorting_column);
    placeholders.push("?");
  }
  if (data.load_status !== undefined) {
    columns.push("load_status");
    values.push(data.load_status);
    placeholders.push("?");
  }
  if (data.last_loaded_at !== undefined) {
    columns.push("last_loaded_at");
    values.push(data.last_loaded_at);
    placeholders.push("?");
  }
  if (data.load_type !== undefined) {
    columns.push("load_type");
    values.push(data.load_type);
    placeholders.push("?");
  }
  if (data.row_counts !== undefined) {
    columns.push("row_counts");
    values.push(JSON.stringify(data.row_counts));
    placeholders.push("?");
  }
  if (data.version !== undefined) {
    columns.push("version");
    values.push(data.version);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }
  if (data.created_by !== undefined) {
    columns.push("created_by");
    values.push(data.created_by);
    placeholders.push("?");
  }

  const sql = `INSERT INTO data_models (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: DataModelsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.data_pool_id !== undefined) {
    sets.push("data_pool_id = ?");
    values.push(data.data_pool_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.model_type !== undefined) {
    sets.push("model_type = ?");
    values.push(data.model_type);
  }
  if (data.activity_table_id !== undefined) {
    sets.push("activity_table_id = ?");
    values.push(data.activity_table_id);
  }
  if (data.case_table_id !== undefined) {
    sets.push("case_table_id = ?");
    values.push(data.case_table_id);
  }
  if (data.case_column !== undefined) {
    sets.push("case_column = ?");
    values.push(data.case_column);
  }
  if (data.activity_column !== undefined) {
    sets.push("activity_column = ?");
    values.push(data.activity_column);
  }
  if (data.timestamp_column !== undefined) {
    sets.push("timestamp_column = ?");
    values.push(data.timestamp_column);
  }
  if (data.sorting_column !== undefined) {
    sets.push("sorting_column = ?");
    values.push(data.sorting_column);
  }
  if (data.load_status !== undefined) {
    sets.push("load_status = ?");
    values.push(data.load_status);
  }
  if (data.last_loaded_at !== undefined) {
    sets.push("last_loaded_at = ?");
    values.push(data.last_loaded_at);
  }
  if (data.load_type !== undefined) {
    sets.push("load_type = ?");
    values.push(data.load_type);
  }
  if (data.row_counts !== undefined) {
    sets.push("row_counts = ?");
    values.push(JSON.stringify(data.row_counts));
  }
  if (data.version !== undefined) {
    sets.push("version = ?");
    values.push(data.version);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }
  if (data.created_by !== undefined) {
    sets.push("created_by = ?");
    values.push(data.created_by);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE data_models SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class DataModelsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): DataModels | null {
    return this.db.query<DataModels, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): DataModels[] {
    return this.db.query<DataModels, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: DataModelsInsert): DataModels {
    const { sql, params } = buildInsert(data);
    return this.db.query<DataModels, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: DataModelsUpdate, tenantId: string): DataModels | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<DataModels, unknown[]>(sql).get(...params) ?? null;
  }

  delete(id: string, tenantId: string): boolean {
    this.db.query(DELETE_BY_ID).run(id, tenantId);
    return true;
  }

  count(tenantId: string): number {
    const result = this.db.query<{ count: number }, [string]>(COUNT_SQL).get(tenantId);
    return result?.count ?? 0;
  }
}