/**
 * Repository for workflow_activities
 * Source: 14_workflow_eventsource.sql
 */

import { Database } from "bun:sqlite";
import type { WorkflowActivities, WorkflowActivitiesInsert, WorkflowActivitiesUpdate } from "../types/workflow-activities";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "workflow_activities";

const SELECT_BY_ID = "SELECT * FROM workflow_activities WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM workflow_activities WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM workflow_activities WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM workflow_activities`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: WorkflowActivitiesInsert): { sql: string; params: unknown[] } {
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
  if (data.activity_id !== undefined) {
    columns.push("activity_id");
    values.push(data.activity_id);
    placeholders.push("?");
  }
  if (data.activity_type !== undefined) {
    columns.push("activity_type");
    values.push(data.activity_type);
    placeholders.push("?");
  }
  if (data.scheduled_event_id !== undefined) {
    columns.push("scheduled_event_id");
    values.push(data.scheduled_event_id);
    placeholders.push("?");
  }
  if (data.started_event_id !== undefined) {
    columns.push("started_event_id");
    values.push(data.started_event_id);
    placeholders.push("?");
  }
  if (data.completed_event_id !== undefined) {
    columns.push("completed_event_id");
    values.push(data.completed_event_id);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.scheduled_at !== undefined) {
    columns.push("scheduled_at");
    values.push(data.scheduled_at);
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
  if (data.attempt_number !== undefined) {
    columns.push("attempt_number");
    values.push(data.attempt_number);
    placeholders.push("?");
  }
  if (data.max_attempts !== undefined) {
    columns.push("max_attempts");
    values.push(data.max_attempts);
    placeholders.push("?");
  }
  if (data.input !== undefined) {
    columns.push("input");
    values.push(data.input);
    placeholders.push("?");
  }
  if (data.output !== undefined) {
    columns.push("output");
    values.push(data.output);
    placeholders.push("?");
  }
  if (data.error !== undefined) {
    columns.push("error");
    values.push(data.error);
    placeholders.push("?");
  }
  if (data.task_queue !== undefined) {
    columns.push("task_queue");
    values.push(data.task_queue);
    placeholders.push("?");
  }

  const sql = `INSERT INTO workflow_activities (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: WorkflowActivitiesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.execution_id !== undefined) {
    sets.push("execution_id = ?");
    values.push(data.execution_id);
  }
  if (data.activity_id !== undefined) {
    sets.push("activity_id = ?");
    values.push(data.activity_id);
  }
  if (data.activity_type !== undefined) {
    sets.push("activity_type = ?");
    values.push(data.activity_type);
  }
  if (data.scheduled_event_id !== undefined) {
    sets.push("scheduled_event_id = ?");
    values.push(data.scheduled_event_id);
  }
  if (data.started_event_id !== undefined) {
    sets.push("started_event_id = ?");
    values.push(data.started_event_id);
  }
  if (data.completed_event_id !== undefined) {
    sets.push("completed_event_id = ?");
    values.push(data.completed_event_id);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.scheduled_at !== undefined) {
    sets.push("scheduled_at = ?");
    values.push(data.scheduled_at);
  }
  if (data.started_at !== undefined) {
    sets.push("started_at = ?");
    values.push(data.started_at);
  }
  if (data.completed_at !== undefined) {
    sets.push("completed_at = ?");
    values.push(data.completed_at);
  }
  if (data.attempt_number !== undefined) {
    sets.push("attempt_number = ?");
    values.push(data.attempt_number);
  }
  if (data.max_attempts !== undefined) {
    sets.push("max_attempts = ?");
    values.push(data.max_attempts);
  }
  if (data.input !== undefined) {
    sets.push("input = ?");
    values.push(data.input);
  }
  if (data.output !== undefined) {
    sets.push("output = ?");
    values.push(data.output);
  }
  if (data.error !== undefined) {
    sets.push("error = ?");
    values.push(data.error);
  }
  if (data.task_queue !== undefined) {
    sets.push("task_queue = ?");
    values.push(data.task_queue);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE workflow_activities SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class WorkflowActivitiesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): WorkflowActivities | null {
    return this.db.query<WorkflowActivities, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): WorkflowActivities[] {
    return this.db.query<WorkflowActivities, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: WorkflowActivitiesInsert): WorkflowActivities {
    const { sql, params } = buildInsert(data);
    return this.db.query<WorkflowActivities, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: WorkflowActivitiesUpdate, tenantId: string): WorkflowActivities | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<WorkflowActivities, unknown[]>(sql).get(...params) ?? null;
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