/**
 * Repository for actions
 * Source: 10_automation.sql
 */

import { Database } from "bun:sqlite";
import type { Actions, ActionsInsert, ActionsUpdate } from "../types/actions";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "actions";

const SELECT_BY_ID = "SELECT * FROM actions WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM actions WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM actions WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM actions`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ActionsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.rule_id !== undefined) {
    columns.push("rule_id");
    values.push(data.rule_id);
    placeholders.push("?");
  }
  if (data.action_type !== undefined) {
    columns.push("action_type");
    values.push(data.action_type);
    placeholders.push("?");
  }
  if (data.action_order !== undefined) {
    columns.push("action_order");
    values.push(data.action_order);
    placeholders.push("?");
  }
  if (data.configuration !== undefined) {
    columns.push("configuration");
    values.push(JSON.stringify(data.configuration));
    placeholders.push("?");
  }
  if (data.is_active !== undefined) {
    columns.push("is_active");
    values.push(data.is_active);
    placeholders.push("?");
  }

  const sql = `INSERT INTO actions (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ActionsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.rule_id !== undefined) {
    sets.push("rule_id = ?");
    values.push(data.rule_id);
  }
  if (data.action_type !== undefined) {
    sets.push("action_type = ?");
    values.push(data.action_type);
  }
  if (data.action_order !== undefined) {
    sets.push("action_order = ?");
    values.push(data.action_order);
  }
  if (data.configuration !== undefined) {
    sets.push("configuration = ?");
    values.push(JSON.stringify(data.configuration));
  }
  if (data.is_active !== undefined) {
    sets.push("is_active = ?");
    values.push(data.is_active);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE actions SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ActionsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Actions | null {
    return this.db.query<Actions, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Actions[] {
    return this.db.query<Actions, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ActionsInsert): Actions {
    const { sql, params } = buildInsert(data);
    return this.db.query<Actions, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ActionsUpdate, tenantId: string): Actions | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Actions, unknown[]>(sql).get(...params) ?? null;
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