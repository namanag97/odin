/**
 * Repository for records
 * Source: 16_semantic.sql
 */

import { Database } from "bun:sqlite";
import type { Records, RecordsInsert, RecordsUpdate } from "../types/records";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "records";

const SELECT_BY_ID = "SELECT * FROM records WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM records WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM records WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM records`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: RecordsInsert): { sql: string; params: unknown[] } {
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
  if (data.base_table !== undefined) {
    columns.push("base_table");
    values.push(data.base_table);
    placeholders.push("?");
  }
  if (data.identifier_attribute !== undefined) {
    columns.push("identifier_attribute");
    values.push(data.identifier_attribute);
    placeholders.push("?");
  }
  if (data.default_sort_attribute !== undefined) {
    columns.push("default_sort_attribute");
    values.push(data.default_sort_attribute);
    placeholders.push("?");
  }
  if (data.default_sort_order !== undefined) {
    columns.push("default_sort_order");
    values.push(data.default_sort_order);
    placeholders.push("?");
  }
  if (data.icon !== undefined) {
    columns.push("icon");
    values.push(data.icon);
    placeholders.push("?");
  }
  if (data.color !== undefined) {
    columns.push("color");
    values.push(data.color);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO records (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: RecordsUpdate, tenantId: string): { sql: string; params: unknown[] } {
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
  if (data.base_table !== undefined) {
    sets.push("base_table = ?");
    values.push(data.base_table);
  }
  if (data.identifier_attribute !== undefined) {
    sets.push("identifier_attribute = ?");
    values.push(data.identifier_attribute);
  }
  if (data.default_sort_attribute !== undefined) {
    sets.push("default_sort_attribute = ?");
    values.push(data.default_sort_attribute);
  }
  if (data.default_sort_order !== undefined) {
    sets.push("default_sort_order = ?");
    values.push(data.default_sort_order);
  }
  if (data.icon !== undefined) {
    sets.push("icon = ?");
    values.push(data.icon);
  }
  if (data.color !== undefined) {
    sets.push("color = ?");
    values.push(data.color);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE records SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class RecordsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Records | null {
    return this.db.query<Records, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Records[] {
    return this.db.query<Records, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: RecordsInsert): Records {
    const { sql, params } = buildInsert(data);
    return this.db.query<Records, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: RecordsUpdate, tenantId: string): Records | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Records, unknown[]>(sql).get(...params) ?? null;
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