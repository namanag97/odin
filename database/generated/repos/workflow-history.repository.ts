/**
 * Repository for workflow_history
 * Source: 14_workflow_eventsource.sql
 */

import { Database } from "bun:sqlite";
import type { WorkflowHistory, WorkflowHistoryInsert, WorkflowHistoryUpdate } from "../types/workflow-history";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "workflow_history";

const SELECT_BY_ID = "SELECT * FROM workflow_history WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM workflow_history WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM workflow_history WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM workflow_history`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: WorkflowHistoryInsert): { sql: string; params: unknown[] } {
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
  if (data.event_sequence !== undefined) {
    columns.push("event_sequence");
    values.push(data.event_sequence);
    placeholders.push("?");
  }
  if (data.event_type !== undefined) {
    columns.push("event_type");
    values.push(data.event_type);
    placeholders.push("?");
  }
  if (data.event_timestamp !== undefined) {
    columns.push("event_timestamp");
    values.push(data.event_timestamp);
    placeholders.push("?");
  }
  if (data.event_data !== undefined) {
    columns.push("event_data");
    values.push(data.event_data);
    placeholders.push("?");
  }
  if (data.event_metadata !== undefined) {
    columns.push("event_metadata");
    values.push(JSON.stringify(data.event_metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO workflow_history (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: WorkflowHistoryUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.execution_id !== undefined) {
    sets.push("execution_id = ?");
    values.push(data.execution_id);
  }
  if (data.event_sequence !== undefined) {
    sets.push("event_sequence = ?");
    values.push(data.event_sequence);
  }
  if (data.event_type !== undefined) {
    sets.push("event_type = ?");
    values.push(data.event_type);
  }
  if (data.event_timestamp !== undefined) {
    sets.push("event_timestamp = ?");
    values.push(data.event_timestamp);
  }
  if (data.event_data !== undefined) {
    sets.push("event_data = ?");
    values.push(data.event_data);
  }
  if (data.event_metadata !== undefined) {
    sets.push("event_metadata = ?");
    values.push(JSON.stringify(data.event_metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE workflow_history SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class WorkflowHistoryRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): WorkflowHistory | null {
    return this.db.query<WorkflowHistory, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): WorkflowHistory[] {
    return this.db.query<WorkflowHistory, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: WorkflowHistoryInsert): WorkflowHistory {
    const { sql, params } = buildInsert(data);
    return this.db.query<WorkflowHistory, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: WorkflowHistoryUpdate, tenantId: string): WorkflowHistory | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<WorkflowHistory, unknown[]>(sql).get(...params) ?? null;
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