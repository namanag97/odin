/**
 * Repository for action_flow_executions
 * Source: 18_automation_enhanced.sql
 */

import { Database } from "bun:sqlite";
import type { ActionFlowExecutions, ActionFlowExecutionsInsert, ActionFlowExecutionsUpdate } from "../types/action-flow-executions";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "action_flow_executions";

const SELECT_BY_ID = "SELECT * FROM action_flow_executions WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM action_flow_executions WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM action_flow_executions WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM action_flow_executions`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ActionFlowExecutionsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.action_flow_id !== undefined) {
    columns.push("action_flow_id");
    values.push(data.action_flow_id);
    placeholders.push("?");
  }
  if (data.triggered_by !== undefined) {
    columns.push("triggered_by");
    values.push(data.triggered_by);
    placeholders.push("?");
  }
  if (data.triggered_by_user_id !== undefined) {
    columns.push("triggered_by_user_id");
    values.push(data.triggered_by_user_id);
    placeholders.push("?");
  }
  if (data.trigger_data !== undefined) {
    columns.push("trigger_data");
    values.push(JSON.stringify(data.trigger_data));
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.started_at !== undefined) {
    columns.push("started_at");
    values.push(data.started_at);
    placeholders.push("?");
  }
  if (data.completed_at !== undefined) {
    columns.push("completed_at");
    values.push(data.completed_at);
    placeholders.push("?");
  }
  if (data.duration_ms !== undefined) {
    columns.push("duration_ms");
    values.push(data.duration_ms);
    placeholders.push("?");
  }
  if (data.cycles_completed !== undefined) {
    columns.push("cycles_completed");
    values.push(data.cycles_completed);
    placeholders.push("?");
  }
  if (data.bundles_processed !== undefined) {
    columns.push("bundles_processed");
    values.push(data.bundles_processed);
    placeholders.push("?");
  }
  if (data.input_values !== undefined) {
    columns.push("input_values");
    values.push(JSON.stringify(data.input_values));
    placeholders.push("?");
  }
  if (data.output_values !== undefined) {
    columns.push("output_values");
    values.push(JSON.stringify(data.output_values));
    placeholders.push("?");
  }
  if (data.error_message !== undefined) {
    columns.push("error_message");
    values.push(data.error_message);
    placeholders.push("?");
  }
  if (data.error_module_id !== undefined) {
    columns.push("error_module_id");
    values.push(data.error_module_id);
    placeholders.push("?");
  }
  if (data.execution_log !== undefined) {
    columns.push("execution_log");
    values.push(JSON.stringify(data.execution_log));
    placeholders.push("?");
  }
  if (data.is_data_confidential !== undefined) {
    columns.push("is_data_confidential");
    values.push(data.is_data_confidential);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO action_flow_executions (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ActionFlowExecutionsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.action_flow_id !== undefined) {
    sets.push("action_flow_id = ?");
    values.push(data.action_flow_id);
  }
  if (data.triggered_by !== undefined) {
    sets.push("triggered_by = ?");
    values.push(data.triggered_by);
  }
  if (data.triggered_by_user_id !== undefined) {
    sets.push("triggered_by_user_id = ?");
    values.push(data.triggered_by_user_id);
  }
  if (data.trigger_data !== undefined) {
    sets.push("trigger_data = ?");
    values.push(JSON.stringify(data.trigger_data));
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.started_at !== undefined) {
    sets.push("started_at = ?");
    values.push(data.started_at);
  }
  if (data.completed_at !== undefined) {
    sets.push("completed_at = ?");
    values.push(data.completed_at);
  }
  if (data.duration_ms !== undefined) {
    sets.push("duration_ms = ?");
    values.push(data.duration_ms);
  }
  if (data.cycles_completed !== undefined) {
    sets.push("cycles_completed = ?");
    values.push(data.cycles_completed);
  }
  if (data.bundles_processed !== undefined) {
    sets.push("bundles_processed = ?");
    values.push(data.bundles_processed);
  }
  if (data.input_values !== undefined) {
    sets.push("input_values = ?");
    values.push(JSON.stringify(data.input_values));
  }
  if (data.output_values !== undefined) {
    sets.push("output_values = ?");
    values.push(JSON.stringify(data.output_values));
  }
  if (data.error_message !== undefined) {
    sets.push("error_message = ?");
    values.push(data.error_message);
  }
  if (data.error_module_id !== undefined) {
    sets.push("error_module_id = ?");
    values.push(data.error_module_id);
  }
  if (data.execution_log !== undefined) {
    sets.push("execution_log = ?");
    values.push(JSON.stringify(data.execution_log));
  }
  if (data.is_data_confidential !== undefined) {
    sets.push("is_data_confidential = ?");
    values.push(data.is_data_confidential);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE action_flow_executions SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ActionFlowExecutionsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ActionFlowExecutions | null {
    return this.db.query<ActionFlowExecutions, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ActionFlowExecutions[] {
    return this.db.query<ActionFlowExecutions, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ActionFlowExecutionsInsert): ActionFlowExecutions {
    const { sql, params } = buildInsert(data);
    return this.db.query<ActionFlowExecutions, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ActionFlowExecutionsUpdate, tenantId: string): ActionFlowExecutions | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ActionFlowExecutions, unknown[]>(sql).get(...params) ?? null;
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