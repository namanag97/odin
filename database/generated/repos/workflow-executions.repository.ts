/**
 * Repository for workflow_executions
 * Source: 14_workflow_eventsource.sql
 */

import { Database } from "bun:sqlite";
import type { WorkflowExecutions, WorkflowExecutionsInsert, WorkflowExecutionsUpdate } from "../types/workflow-executions";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "workflow_executions";

const SELECT_BY_ID = "SELECT * FROM workflow_executions WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM workflow_executions WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM workflow_executions WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM workflow_executions`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: WorkflowExecutionsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.workflow_id !== undefined) {
    columns.push("workflow_id");
    values.push(data.workflow_id);
    placeholders.push("?");
  }
  if (data.run_id !== undefined) {
    columns.push("run_id");
    values.push(data.run_id);
    placeholders.push("?");
  }
  if (data.workflow_type !== undefined) {
    columns.push("workflow_type");
    values.push(data.workflow_type);
    placeholders.push("?");
  }
  if (data.workflow_type_id !== undefined) {
    columns.push("workflow_type_id");
    values.push(data.workflow_type_id);
    placeholders.push("?");
  }
  if (data.parent_execution_id !== undefined) {
    columns.push("parent_execution_id");
    values.push(data.parent_execution_id);
    placeholders.push("?");
  }
  if (data.parent_run_id !== undefined) {
    columns.push("parent_run_id");
    values.push(data.parent_run_id);
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
  if (data.timeout_seconds !== undefined) {
    columns.push("timeout_seconds");
    values.push(data.timeout_seconds);
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
  if (data.search_attributes !== undefined) {
    columns.push("search_attributes");
    values.push(JSON.stringify(data.search_attributes));
    placeholders.push("?");
  }

  const sql = `INSERT INTO workflow_executions (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: WorkflowExecutionsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.workflow_id !== undefined) {
    sets.push("workflow_id = ?");
    values.push(data.workflow_id);
  }
  if (data.run_id !== undefined) {
    sets.push("run_id = ?");
    values.push(data.run_id);
  }
  if (data.workflow_type !== undefined) {
    sets.push("workflow_type = ?");
    values.push(data.workflow_type);
  }
  if (data.workflow_type_id !== undefined) {
    sets.push("workflow_type_id = ?");
    values.push(data.workflow_type_id);
  }
  if (data.parent_execution_id !== undefined) {
    sets.push("parent_execution_id = ?");
    values.push(data.parent_execution_id);
  }
  if (data.parent_run_id !== undefined) {
    sets.push("parent_run_id = ?");
    values.push(data.parent_run_id);
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
  if (data.timeout_seconds !== undefined) {
    sets.push("timeout_seconds = ?");
    values.push(data.timeout_seconds);
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
  if (data.attempt_number !== undefined) {
    sets.push("attempt_number = ?");
    values.push(data.attempt_number);
  }
  if (data.max_attempts !== undefined) {
    sets.push("max_attempts = ?");
    values.push(data.max_attempts);
  }
  if (data.search_attributes !== undefined) {
    sets.push("search_attributes = ?");
    values.push(JSON.stringify(data.search_attributes));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE workflow_executions SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class WorkflowExecutionsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): WorkflowExecutions | null {
    return this.db.query<WorkflowExecutions, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): WorkflowExecutions[] {
    return this.db.query<WorkflowExecutions, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: WorkflowExecutionsInsert): WorkflowExecutions {
    const { sql, params } = buildInsert(data);
    return this.db.query<WorkflowExecutions, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: WorkflowExecutionsUpdate, tenantId: string): WorkflowExecutions | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<WorkflowExecutions, unknown[]>(sql).get(...params) ?? null;
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