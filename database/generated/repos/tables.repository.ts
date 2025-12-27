/**
 * Repository for tables
 * Source: 15_data_model.sql
 */

import { Database } from "bun:sqlite";
import type { Tables, TablesInsert, TablesUpdate } from "../types/tables";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "tables";

const SELECT_BY_ID = "SELECT * FROM tables WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM tables WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM tables WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM tables`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: TablesInsert): { sql: string; params: unknown[] } {
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
  if (data.display_name !== undefined) {
    columns.push("display_name");
    values.push(data.display_name);
    placeholders.push("?");
  }
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.table_type !== undefined) {
    columns.push("table_type");
    values.push(data.table_type);
    placeholders.push("?");
  }
  if (data.source_connection_id !== undefined) {
    columns.push("source_connection_id");
    values.push(data.source_connection_id);
    placeholders.push("?");
  }
  if (data.source_schema !== undefined) {
    columns.push("source_schema");
    values.push(data.source_schema);
    placeholders.push("?");
  }
  if (data.source_table !== undefined) {
    columns.push("source_table");
    values.push(data.source_table);
    placeholders.push("?");
  }
  if (data.transformation_sql !== undefined) {
    columns.push("transformation_sql");
    values.push(data.transformation_sql);
    placeholders.push("?");
  }
  if (data.row_count !== undefined) {
    columns.push("row_count");
    values.push(data.row_count);
    placeholders.push("?");
  }
  if (data.size_bytes !== undefined) {
    columns.push("size_bytes");
    values.push(data.size_bytes);
    placeholders.push("?");
  }
  if (data.last_sync_at !== undefined) {
    columns.push("last_sync_at");
    values.push(data.last_sync_at);
    placeholders.push("?");
  }
  if (data.is_activity_table !== undefined) {
    columns.push("is_activity_table");
    values.push(data.is_activity_table);
    placeholders.push("?");
  }
  if (data.is_case_table !== undefined) {
    columns.push("is_case_table");
    values.push(data.is_case_table);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO tables (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: TablesUpdate, tenantId: string): { sql: string; params: unknown[] } {
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
  if (data.display_name !== undefined) {
    sets.push("display_name = ?");
    values.push(data.display_name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.table_type !== undefined) {
    sets.push("table_type = ?");
    values.push(data.table_type);
  }
  if (data.source_connection_id !== undefined) {
    sets.push("source_connection_id = ?");
    values.push(data.source_connection_id);
  }
  if (data.source_schema !== undefined) {
    sets.push("source_schema = ?");
    values.push(data.source_schema);
  }
  if (data.source_table !== undefined) {
    sets.push("source_table = ?");
    values.push(data.source_table);
  }
  if (data.transformation_sql !== undefined) {
    sets.push("transformation_sql = ?");
    values.push(data.transformation_sql);
  }
  if (data.row_count !== undefined) {
    sets.push("row_count = ?");
    values.push(data.row_count);
  }
  if (data.size_bytes !== undefined) {
    sets.push("size_bytes = ?");
    values.push(data.size_bytes);
  }
  if (data.last_sync_at !== undefined) {
    sets.push("last_sync_at = ?");
    values.push(data.last_sync_at);
  }
  if (data.is_activity_table !== undefined) {
    sets.push("is_activity_table = ?");
    values.push(data.is_activity_table);
  }
  if (data.is_case_table !== undefined) {
    sets.push("is_case_table = ?");
    values.push(data.is_case_table);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE tables SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class TablesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Tables | null {
    return this.db.query<Tables, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Tables[] {
    return this.db.query<Tables, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: TablesInsert): Tables {
    const { sql, params } = buildInsert(data);
    return this.db.query<Tables, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: TablesUpdate, tenantId: string): Tables | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Tables, unknown[]>(sql).get(...params) ?? null;
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