/**
 * Repository for tasks
 * Source: 18_automation_enhanced.sql
 */

import { Database } from "bun:sqlite";
import type { Tasks, TasksInsert, TasksUpdate } from "../types/tasks";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "tasks";

const SELECT_BY_ID = "SELECT * FROM tasks WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM tasks WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM tasks WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM tasks`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: TasksInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.task_type_id !== undefined) {
    columns.push("task_type_id");
    values.push(data.task_type_id);
    placeholders.push("?");
  }
  if (data.title !== undefined) {
    columns.push("title");
    values.push(data.title);
    placeholders.push("?");
  }
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.priority !== undefined) {
    columns.push("priority");
    values.push(data.priority);
    placeholders.push("?");
  }
  if (data.assignee_id !== undefined) {
    columns.push("assignee_id");
    values.push(data.assignee_id);
    placeholders.push("?");
  }
  if (data.reporter_id !== undefined) {
    columns.push("reporter_id");
    values.push(data.reporter_id);
    placeholders.push("?");
  }
  if (data.due_date !== undefined) {
    columns.push("due_date");
    values.push(data.due_date);
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
  if (data.related_signal_id !== undefined) {
    columns.push("related_signal_id");
    values.push(data.related_signal_id);
    placeholders.push("?");
  }
  if (data.related_record_type !== undefined) {
    columns.push("related_record_type");
    values.push(data.related_record_type);
    placeholders.push("?");
  }
  if (data.related_record_key !== undefined) {
    columns.push("related_record_key");
    values.push(data.related_record_key);
    placeholders.push("?");
  }
  if (data.source_view_id !== undefined) {
    columns.push("source_view_id");
    values.push(data.source_view_id);
    placeholders.push("?");
  }
  if (data.source_action_flow_id !== undefined) {
    columns.push("source_action_flow_id");
    values.push(data.source_action_flow_id);
    placeholders.push("?");
  }
  if (data.attributes !== undefined) {
    columns.push("attributes");
    values.push(JSON.stringify(data.attributes));
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO tasks (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: TasksUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.task_type_id !== undefined) {
    sets.push("task_type_id = ?");
    values.push(data.task_type_id);
  }
  if (data.title !== undefined) {
    sets.push("title = ?");
    values.push(data.title);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.priority !== undefined) {
    sets.push("priority = ?");
    values.push(data.priority);
  }
  if (data.assignee_id !== undefined) {
    sets.push("assignee_id = ?");
    values.push(data.assignee_id);
  }
  if (data.reporter_id !== undefined) {
    sets.push("reporter_id = ?");
    values.push(data.reporter_id);
  }
  if (data.due_date !== undefined) {
    sets.push("due_date = ?");
    values.push(data.due_date);
  }
  if (data.started_at !== undefined) {
    sets.push("started_at = ?");
    values.push(data.started_at);
  }
  if (data.completed_at !== undefined) {
    sets.push("completed_at = ?");
    values.push(data.completed_at);
  }
  if (data.related_signal_id !== undefined) {
    sets.push("related_signal_id = ?");
    values.push(data.related_signal_id);
  }
  if (data.related_record_type !== undefined) {
    sets.push("related_record_type = ?");
    values.push(data.related_record_type);
  }
  if (data.related_record_key !== undefined) {
    sets.push("related_record_key = ?");
    values.push(data.related_record_key);
  }
  if (data.source_view_id !== undefined) {
    sets.push("source_view_id = ?");
    values.push(data.source_view_id);
  }
  if (data.source_action_flow_id !== undefined) {
    sets.push("source_action_flow_id = ?");
    values.push(data.source_action_flow_id);
  }
  if (data.attributes !== undefined) {
    sets.push("attributes = ?");
    values.push(JSON.stringify(data.attributes));
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE tasks SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class TasksRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Tasks | null {
    return this.db.query<Tasks, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Tasks[] {
    return this.db.query<Tasks, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: TasksInsert): Tasks {
    const { sql, params } = buildInsert(data);
    return this.db.query<Tasks, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: TasksUpdate, tenantId: string): Tasks | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Tasks, unknown[]>(sql).get(...params) ?? null;
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