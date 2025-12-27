/**
 * Repository for variables
 * Source: 16_semantic.sql
 */

import { Database } from "bun:sqlite";
import type { Variables, VariablesInsert, VariablesUpdate } from "../types/variables";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "variables";

const SELECT_BY_ID = "SELECT * FROM variables WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM variables WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM variables WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM variables`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: VariablesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.scope_type !== undefined) {
    columns.push("scope_type");
    values.push(data.scope_type);
    placeholders.push("?");
  }
  if (data.scope_id !== undefined) {
    columns.push("scope_id");
    values.push(data.scope_id);
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
  if (data.data_type !== undefined) {
    columns.push("data_type");
    values.push(data.data_type);
    placeholders.push("?");
  }
  if (data.default_value !== undefined) {
    columns.push("default_value");
    values.push(data.default_value);
    placeholders.push("?");
  }
  if (data.current_value !== undefined) {
    columns.push("current_value");
    values.push(data.current_value);
    placeholders.push("?");
  }
  if (data.validation_pql !== undefined) {
    columns.push("validation_pql");
    values.push(data.validation_pql);
    placeholders.push("?");
  }
  if (data.is_required !== undefined) {
    columns.push("is_required");
    values.push(data.is_required);
    placeholders.push("?");
  }
  if (data.is_user_editable !== undefined) {
    columns.push("is_user_editable");
    values.push(data.is_user_editable);
    placeholders.push("?");
  }
  if (data.ui_component !== undefined) {
    columns.push("ui_component");
    values.push(data.ui_component);
    placeholders.push("?");
  }
  if (data.options_pql !== undefined) {
    columns.push("options_pql");
    values.push(data.options_pql);
    placeholders.push("?");
  }

  const sql = `INSERT INTO variables (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: VariablesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.scope_type !== undefined) {
    sets.push("scope_type = ?");
    values.push(data.scope_type);
  }
  if (data.scope_id !== undefined) {
    sets.push("scope_id = ?");
    values.push(data.scope_id);
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
  if (data.data_type !== undefined) {
    sets.push("data_type = ?");
    values.push(data.data_type);
  }
  if (data.default_value !== undefined) {
    sets.push("default_value = ?");
    values.push(data.default_value);
  }
  if (data.current_value !== undefined) {
    sets.push("current_value = ?");
    values.push(data.current_value);
  }
  if (data.validation_pql !== undefined) {
    sets.push("validation_pql = ?");
    values.push(data.validation_pql);
  }
  if (data.is_required !== undefined) {
    sets.push("is_required = ?");
    values.push(data.is_required);
  }
  if (data.is_user_editable !== undefined) {
    sets.push("is_user_editable = ?");
    values.push(data.is_user_editable);
  }
  if (data.ui_component !== undefined) {
    sets.push("ui_component = ?");
    values.push(data.ui_component);
  }
  if (data.options_pql !== undefined) {
    sets.push("options_pql = ?");
    values.push(data.options_pql);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE variables SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class VariablesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Variables | null {
    return this.db.query<Variables, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Variables[] {
    return this.db.query<Variables, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: VariablesInsert): Variables {
    const { sql, params } = buildInsert(data);
    return this.db.query<Variables, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: VariablesUpdate, tenantId: string): Variables | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Variables, unknown[]>(sql).get(...params) ?? null;
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