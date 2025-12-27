/**
 * Repository for foreign_keys
 * Source: 15_data_model.sql
 */

import { Database } from "bun:sqlite";
import type { ForeignKeys, ForeignKeysInsert, ForeignKeysUpdate } from "../types/foreign-keys";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "foreign_keys";

const SELECT_BY_ID = "SELECT * FROM foreign_keys WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM foreign_keys WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM foreign_keys WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM foreign_keys`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ForeignKeysInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.data_model_id !== undefined) {
    columns.push("data_model_id");
    values.push(data.data_model_id);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.source_table_id !== undefined) {
    columns.push("source_table_id");
    values.push(data.source_table_id);
    placeholders.push("?");
  }
  if (data.source_columns !== undefined) {
    columns.push("source_columns");
    values.push(data.source_columns);
    placeholders.push("?");
  }
  if (data.target_table_id !== undefined) {
    columns.push("target_table_id");
    values.push(data.target_table_id);
    placeholders.push("?");
  }
  if (data.target_columns !== undefined) {
    columns.push("target_columns");
    values.push(data.target_columns);
    placeholders.push("?");
  }
  if (data.cardinality !== undefined) {
    columns.push("cardinality");
    values.push(data.cardinality);
    placeholders.push("?");
  }
  if (data.is_enforced !== undefined) {
    columns.push("is_enforced");
    values.push(data.is_enforced);
    placeholders.push("?");
  }

  const sql = `INSERT INTO foreign_keys (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ForeignKeysUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.data_model_id !== undefined) {
    sets.push("data_model_id = ?");
    values.push(data.data_model_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.source_table_id !== undefined) {
    sets.push("source_table_id = ?");
    values.push(data.source_table_id);
  }
  if (data.source_columns !== undefined) {
    sets.push("source_columns = ?");
    values.push(data.source_columns);
  }
  if (data.target_table_id !== undefined) {
    sets.push("target_table_id = ?");
    values.push(data.target_table_id);
  }
  if (data.target_columns !== undefined) {
    sets.push("target_columns = ?");
    values.push(data.target_columns);
  }
  if (data.cardinality !== undefined) {
    sets.push("cardinality = ?");
    values.push(data.cardinality);
  }
  if (data.is_enforced !== undefined) {
    sets.push("is_enforced = ?");
    values.push(data.is_enforced);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE foreign_keys SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ForeignKeysRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ForeignKeys | null {
    return this.db.query<ForeignKeys, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ForeignKeys[] {
    return this.db.query<ForeignKeys, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ForeignKeysInsert): ForeignKeys {
    const { sql, params } = buildInsert(data);
    return this.db.query<ForeignKeys, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ForeignKeysUpdate, tenantId: string): ForeignKeys | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ForeignKeys, unknown[]>(sql).get(...params) ?? null;
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