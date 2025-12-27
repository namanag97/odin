/**
 * Repository for filters
 * Source: 16_semantic.sql
 */

import { Database } from "bun:sqlite";
import type { Filters, FiltersInsert, FiltersUpdate } from "../types/filters";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "filters";

const SELECT_BY_ID = "SELECT * FROM filters WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM filters WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM filters WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM filters`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: FiltersInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.knowledge_model_id !== undefined) {
    columns.push("knowledge_model_id");
    values.push(data.knowledge_model_id);
    placeholders.push("?");
  }
  if (data.key !== undefined) {
    columns.push("key");
    values.push(data.key);
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
  if (data.pql_expression !== undefined) {
    columns.push("pql_expression");
    values.push(data.pql_expression);
    placeholders.push("?");
  }
  if (data.base_table !== undefined) {
    columns.push("base_table");
    values.push(data.base_table);
    placeholders.push("?");
  }
  if (data.filter_type !== undefined) {
    columns.push("filter_type");
    values.push(data.filter_type);
    placeholders.push("?");
  }
  if (data.category !== undefined) {
    columns.push("category");
    values.push(data.category);
    placeholders.push("?");
  }
  if (data.is_default !== undefined) {
    columns.push("is_default");
    values.push(data.is_default);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO filters (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: FiltersUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.knowledge_model_id !== undefined) {
    sets.push("knowledge_model_id = ?");
    values.push(data.knowledge_model_id);
  }
  if (data.key !== undefined) {
    sets.push("key = ?");
    values.push(data.key);
  }
  if (data.display_name !== undefined) {
    sets.push("display_name = ?");
    values.push(data.display_name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.pql_expression !== undefined) {
    sets.push("pql_expression = ?");
    values.push(data.pql_expression);
  }
  if (data.base_table !== undefined) {
    sets.push("base_table = ?");
    values.push(data.base_table);
  }
  if (data.filter_type !== undefined) {
    sets.push("filter_type = ?");
    values.push(data.filter_type);
  }
  if (data.category !== undefined) {
    sets.push("category = ?");
    values.push(data.category);
  }
  if (data.is_default !== undefined) {
    sets.push("is_default = ?");
    values.push(data.is_default);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE filters SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class FiltersRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Filters | null {
    return this.db.query<Filters, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Filters[] {
    return this.db.query<Filters, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: FiltersInsert): Filters {
    const { sql, params } = buildInsert(data);
    return this.db.query<Filters, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: FiltersUpdate, tenantId: string): Filters | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Filters, unknown[]>(sql).get(...params) ?? null;
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