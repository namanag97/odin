/**
 * Repository for action_executions
 * Source: 10_automation.sql
 */

import { Database } from "bun:sqlite";
import type { ActionExecutions, ActionExecutionsInsert, ActionExecutionsUpdate } from "../types/action-executions";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "action_executions";

const SELECT_BY_ID = "SELECT * FROM action_executions WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM action_executions WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM action_executions WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM action_executions`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ActionExecutionsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.action_id !== undefined) {
    columns.push("action_id");
    values.push(data.action_id);
    placeholders.push("?");
  }
  if (data.rule_id !== undefined) {
    columns.push("rule_id");
    values.push(data.rule_id);
    placeholders.push("?");
  }
  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.triggered_at !== undefined) {
    columns.push("triggered_at");
    values.push(data.triggered_at);
    placeholders.push("?");
  }
  if (data.trigger_context !== undefined) {
    columns.push("trigger_context");
    values.push(data.trigger_context);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.response !== undefined) {
    columns.push("response");
    values.push(data.response);
    placeholders.push("?");
  }
  if (data.error_message !== undefined) {
    columns.push("error_message");
    values.push(data.error_message);
    placeholders.push("?");
  }
  if (data.execution_time_ms !== undefined) {
    columns.push("execution_time_ms");
    values.push(data.execution_time_ms);
    placeholders.push("?");
  }

  const sql = `INSERT INTO action_executions (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ActionExecutionsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.action_id !== undefined) {
    sets.push("action_id = ?");
    values.push(data.action_id);
  }
  if (data.rule_id !== undefined) {
    sets.push("rule_id = ?");
    values.push(data.rule_id);
  }
  if (data.triggered_at !== undefined) {
    sets.push("triggered_at = ?");
    values.push(data.triggered_at);
  }
  if (data.trigger_context !== undefined) {
    sets.push("trigger_context = ?");
    values.push(data.trigger_context);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.response !== undefined) {
    sets.push("response = ?");
    values.push(data.response);
  }
  if (data.error_message !== undefined) {
    sets.push("error_message = ?");
    values.push(data.error_message);
  }
  if (data.execution_time_ms !== undefined) {
    sets.push("execution_time_ms = ?");
    values.push(data.execution_time_ms);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE action_executions SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ActionExecutionsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ActionExecutions | null {
    return this.db.query<ActionExecutions, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ActionExecutions[] {
    return this.db.query<ActionExecutions, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ActionExecutionsInsert): ActionExecutions {
    const { sql, params } = buildInsert(data);
    return this.db.query<ActionExecutions, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ActionExecutionsUpdate, tenantId: string): ActionExecutions | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ActionExecutions, unknown[]>(sql).get(...params) ?? null;
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