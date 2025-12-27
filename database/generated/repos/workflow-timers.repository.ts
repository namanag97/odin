/**
 * Repository for workflow_timers
 * Source: 14_workflow_eventsource.sql
 */

import { Database } from "bun:sqlite";
import type { WorkflowTimers, WorkflowTimersInsert, WorkflowTimersUpdate } from "../types/workflow-timers";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "workflow_timers";

const SELECT_BY_ID = "SELECT * FROM workflow_timers WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM workflow_timers WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM workflow_timers WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM workflow_timers`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: WorkflowTimersInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.execution_id !== undefined) {
    columns.push("execution_id");
    values.push(data.execution_id);
    placeholders.push("?");
  }
  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.timer_id !== undefined) {
    columns.push("timer_id");
    values.push(data.timer_id);
    placeholders.push("?");
  }
  if (data.fire_at !== undefined) {
    columns.push("fire_at");
    values.push(data.fire_at);
    placeholders.push("?");
  }
  if (data.duration_seconds !== undefined) {
    columns.push("duration_seconds");
    values.push(data.duration_seconds);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.started_event_id !== undefined) {
    columns.push("started_event_id");
    values.push(data.started_event_id);
    placeholders.push("?");
  }
  if (data.fired_event_id !== undefined) {
    columns.push("fired_event_id");
    values.push(data.fired_event_id);
    placeholders.push("?");
  }

  const sql = `INSERT INTO workflow_timers (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: WorkflowTimersUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.execution_id !== undefined) {
    sets.push("execution_id = ?");
    values.push(data.execution_id);
  }
  if (data.timer_id !== undefined) {
    sets.push("timer_id = ?");
    values.push(data.timer_id);
  }
  if (data.fire_at !== undefined) {
    sets.push("fire_at = ?");
    values.push(data.fire_at);
  }
  if (data.duration_seconds !== undefined) {
    sets.push("duration_seconds = ?");
    values.push(data.duration_seconds);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.started_event_id !== undefined) {
    sets.push("started_event_id = ?");
    values.push(data.started_event_id);
  }
  if (data.fired_event_id !== undefined) {
    sets.push("fired_event_id = ?");
    values.push(data.fired_event_id);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE workflow_timers SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class WorkflowTimersRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): WorkflowTimers | null {
    return this.db.query<WorkflowTimers, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): WorkflowTimers[] {
    return this.db.query<WorkflowTimers, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: WorkflowTimersInsert): WorkflowTimers {
    const { sql, params } = buildInsert(data);
    return this.db.query<WorkflowTimers, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: WorkflowTimersUpdate, tenantId: string): WorkflowTimers | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<WorkflowTimers, unknown[]>(sql).get(...params) ?? null;
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