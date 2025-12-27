/**
 * Repository for action_flows
 * Source: 18_automation_enhanced.sql
 */

import { Database } from "bun:sqlite";
import type { ActionFlows, ActionFlowsInsert, ActionFlowsUpdate } from "../types/action-flows";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "action_flows";

const SELECT_BY_ID = "SELECT * FROM action_flows WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM action_flows WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM action_flows WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM action_flows`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ActionFlowsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.package_id !== undefined) {
    columns.push("package_id");
    values.push(data.package_id);
    placeholders.push("?");
  }
  if (data.key !== undefined) {
    columns.push("key");
    values.push(data.key);
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
  if (data.trigger_type !== undefined) {
    columns.push("trigger_type");
    values.push(data.trigger_type);
    placeholders.push("?");
  }
  if (data.schedule_id !== undefined) {
    columns.push("schedule_id");
    values.push(data.schedule_id);
    placeholders.push("?");
  }
  if (data.webhook_id !== undefined) {
    columns.push("webhook_id");
    values.push(data.webhook_id);
    placeholders.push("?");
  }
  if (data.sensor_id !== undefined) {
    columns.push("sensor_id");
    values.push(data.sensor_id);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.consecutive_error_limit !== undefined) {
    columns.push("consecutive_error_limit");
    values.push(data.consecutive_error_limit);
    placeholders.push("?");
  }
  if (data.consecutive_error_count !== undefined) {
    columns.push("consecutive_error_count");
    values.push(data.consecutive_error_count);
    placeholders.push("?");
  }
  if (data.is_data_confidential !== undefined) {
    columns.push("is_data_confidential");
    values.push(data.is_data_confidential);
    placeholders.push("?");
  }
  if (data.timeout_seconds !== undefined) {
    columns.push("timeout_seconds");
    values.push(data.timeout_seconds);
    placeholders.push("?");
  }
  if (data.max_cycles !== undefined) {
    columns.push("max_cycles");
    values.push(data.max_cycles);
    placeholders.push("?");
  }
  if (data.auto_commit !== undefined) {
    columns.push("auto_commit");
    values.push(data.auto_commit);
    placeholders.push("?");
  }
  if (data.sequential_processing !== undefined) {
    columns.push("sequential_processing");
    values.push(data.sequential_processing);
    placeholders.push("?");
  }
  if (data.incomplete_executions_enabled !== undefined) {
    columns.push("incomplete_executions_enabled");
    values.push(data.incomplete_executions_enabled);
    placeholders.push("?");
  }
  if (data.blueprint !== undefined) {
    columns.push("blueprint");
    values.push(data.blueprint);
    placeholders.push("?");
  }
  if (data.inputs !== undefined) {
    columns.push("inputs");
    values.push(JSON.stringify(data.inputs));
    placeholders.push("?");
  }
  if (data.outputs !== undefined) {
    columns.push("outputs");
    values.push(JSON.stringify(data.outputs));
    placeholders.push("?");
  }
  if (data.last_executed_at !== undefined) {
    columns.push("last_executed_at");
    values.push(data.last_executed_at);
    placeholders.push("?");
  }
  if (data.last_execution_status !== undefined) {
    columns.push("last_execution_status");
    values.push(data.last_execution_status);
    placeholders.push("?");
  }
  if (data.activated_at !== undefined) {
    columns.push("activated_at");
    values.push(data.activated_at);
    placeholders.push("?");
  }
  if (data.deactivated_at !== undefined) {
    columns.push("deactivated_at");
    values.push(data.deactivated_at);
    placeholders.push("?");
  }
  if (data.deactivation_reason !== undefined) {
    columns.push("deactivation_reason");
    values.push(data.deactivation_reason);
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

  const sql = `INSERT INTO action_flows (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ActionFlowsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.package_id !== undefined) {
    sets.push("package_id = ?");
    values.push(data.package_id);
  }
  if (data.key !== undefined) {
    sets.push("key = ?");
    values.push(data.key);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.trigger_type !== undefined) {
    sets.push("trigger_type = ?");
    values.push(data.trigger_type);
  }
  if (data.schedule_id !== undefined) {
    sets.push("schedule_id = ?");
    values.push(data.schedule_id);
  }
  if (data.webhook_id !== undefined) {
    sets.push("webhook_id = ?");
    values.push(data.webhook_id);
  }
  if (data.sensor_id !== undefined) {
    sets.push("sensor_id = ?");
    values.push(data.sensor_id);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.consecutive_error_limit !== undefined) {
    sets.push("consecutive_error_limit = ?");
    values.push(data.consecutive_error_limit);
  }
  if (data.consecutive_error_count !== undefined) {
    sets.push("consecutive_error_count = ?");
    values.push(data.consecutive_error_count);
  }
  if (data.is_data_confidential !== undefined) {
    sets.push("is_data_confidential = ?");
    values.push(data.is_data_confidential);
  }
  if (data.timeout_seconds !== undefined) {
    sets.push("timeout_seconds = ?");
    values.push(data.timeout_seconds);
  }
  if (data.max_cycles !== undefined) {
    sets.push("max_cycles = ?");
    values.push(data.max_cycles);
  }
  if (data.auto_commit !== undefined) {
    sets.push("auto_commit = ?");
    values.push(data.auto_commit);
  }
  if (data.sequential_processing !== undefined) {
    sets.push("sequential_processing = ?");
    values.push(data.sequential_processing);
  }
  if (data.incomplete_executions_enabled !== undefined) {
    sets.push("incomplete_executions_enabled = ?");
    values.push(data.incomplete_executions_enabled);
  }
  if (data.blueprint !== undefined) {
    sets.push("blueprint = ?");
    values.push(data.blueprint);
  }
  if (data.inputs !== undefined) {
    sets.push("inputs = ?");
    values.push(JSON.stringify(data.inputs));
  }
  if (data.outputs !== undefined) {
    sets.push("outputs = ?");
    values.push(JSON.stringify(data.outputs));
  }
  if (data.last_executed_at !== undefined) {
    sets.push("last_executed_at = ?");
    values.push(data.last_executed_at);
  }
  if (data.last_execution_status !== undefined) {
    sets.push("last_execution_status = ?");
    values.push(data.last_execution_status);
  }
  if (data.activated_at !== undefined) {
    sets.push("activated_at = ?");
    values.push(data.activated_at);
  }
  if (data.deactivated_at !== undefined) {
    sets.push("deactivated_at = ?");
    values.push(data.deactivated_at);
  }
  if (data.deactivation_reason !== undefined) {
    sets.push("deactivation_reason = ?");
    values.push(data.deactivation_reason);
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
  const sql = `UPDATE action_flows SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ActionFlowsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ActionFlows | null {
    return this.db.query<ActionFlows, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ActionFlows[] {
    return this.db.query<ActionFlows, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ActionFlowsInsert): ActionFlows {
    const { sql, params } = buildInsert(data);
    return this.db.query<ActionFlows, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ActionFlowsUpdate, tenantId: string): ActionFlows | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ActionFlows, unknown[]>(sql).get(...params) ?? null;
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