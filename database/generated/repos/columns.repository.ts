/**
 * Repository for columns
 * Source: 15_data_model.sql
 */

import { Database } from "bun:sqlite";
import type { Columns, ColumnsInsert, ColumnsUpdate } from "../types/columns";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "columns";

const SELECT_BY_ID = "SELECT * FROM columns WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM columns WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM columns WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM columns`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ColumnsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.table_id !== undefined) {
    columns.push("table_id");
    values.push(data.table_id);
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
  if (data.data_type !== undefined) {
    columns.push("data_type");
    values.push(data.data_type);
    placeholders.push("?");
  }
  if (data.source_data_type !== undefined) {
    columns.push("source_data_type");
    values.push(data.source_data_type);
    placeholders.push("?");
  }
  if (data.is_nullable !== undefined) {
    columns.push("is_nullable");
    values.push(data.is_nullable);
    placeholders.push("?");
  }
  if (data.is_primary_key !== undefined) {
    columns.push("is_primary_key");
    values.push(data.is_primary_key);
    placeholders.push("?");
  }
  if (data.is_indexed !== undefined) {
    columns.push("is_indexed");
    values.push(data.is_indexed);
    placeholders.push("?");
  }
  if (data.default_value !== undefined) {
    columns.push("default_value");
    values.push(data.default_value);
    placeholders.push("?");
  }
  if (data.format_pattern !== undefined) {
    columns.push("format_pattern");
    values.push(data.format_pattern);
    placeholders.push("?");
  }
  if (data.ordinal_position !== undefined) {
    columns.push("ordinal_position");
    values.push(data.ordinal_position);
    placeholders.push("?");
  }
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.statistics !== undefined) {
    columns.push("statistics");
    values.push(JSON.stringify(data.statistics));
    placeholders.push("?");
  }

  const sql = `INSERT INTO columns (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ColumnsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.table_id !== undefined) {
    sets.push("table_id = ?");
    values.push(data.table_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.display_name !== undefined) {
    sets.push("display_name = ?");
    values.push(data.display_name);
  }
  if (data.data_type !== undefined) {
    sets.push("data_type = ?");
    values.push(data.data_type);
  }
  if (data.source_data_type !== undefined) {
    sets.push("source_data_type = ?");
    values.push(data.source_data_type);
  }
  if (data.is_nullable !== undefined) {
    sets.push("is_nullable = ?");
    values.push(data.is_nullable);
  }
  if (data.is_primary_key !== undefined) {
    sets.push("is_primary_key = ?");
    values.push(data.is_primary_key);
  }
  if (data.is_indexed !== undefined) {
    sets.push("is_indexed = ?");
    values.push(data.is_indexed);
  }
  if (data.default_value !== undefined) {
    sets.push("default_value = ?");
    values.push(data.default_value);
  }
  if (data.format_pattern !== undefined) {
    sets.push("format_pattern = ?");
    values.push(data.format_pattern);
  }
  if (data.ordinal_position !== undefined) {
    sets.push("ordinal_position = ?");
    values.push(data.ordinal_position);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.statistics !== undefined) {
    sets.push("statistics = ?");
    values.push(JSON.stringify(data.statistics));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE columns SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ColumnsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Columns | null {
    return this.db.query<Columns, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Columns[] {
    return this.db.query<Columns, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ColumnsInsert): Columns {
    const { sql, params } = buildInsert(data);
    return this.db.query<Columns, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ColumnsUpdate, tenantId: string): Columns | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Columns, unknown[]>(sql).get(...params) ?? null;
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