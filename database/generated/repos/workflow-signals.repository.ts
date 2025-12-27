/**
 * Repository for workflow_signals
 * Source: 14_workflow_eventsource.sql
 */

import { Database } from "bun:sqlite";
import type { WorkflowSignals, WorkflowSignalsInsert, WorkflowSignalsUpdate } from "../types/workflow-signals";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "workflow_signals";

const SELECT_BY_ID = "SELECT * FROM workflow_signals WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM workflow_signals WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM workflow_signals WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM workflow_signals`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: WorkflowSignalsInsert): { sql: string; params: unknown[] } {
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
  if (data.signal_name !== undefined) {
    columns.push("signal_name");
    values.push(data.signal_name);
    placeholders.push("?");
  }
  if (data.signal_input !== undefined) {
    columns.push("signal_input");
    values.push(data.signal_input);
    placeholders.push("?");
  }
  if (data.source_type !== undefined) {
    columns.push("source_type");
    values.push(data.source_type);
    placeholders.push("?");
  }
  if (data.source_id !== undefined) {
    columns.push("source_id");
    values.push(data.source_id);
    placeholders.push("?");
  }
  if (data.received_at !== undefined) {
    columns.push("received_at");
    values.push(data.received_at);
    placeholders.push("?");
  }
  if (data.processed_at !== undefined) {
    columns.push("processed_at");
    values.push(data.processed_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO workflow_signals (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: WorkflowSignalsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.execution_id !== undefined) {
    sets.push("execution_id = ?");
    values.push(data.execution_id);
  }
  if (data.signal_name !== undefined) {
    sets.push("signal_name = ?");
    values.push(data.signal_name);
  }
  if (data.signal_input !== undefined) {
    sets.push("signal_input = ?");
    values.push(data.signal_input);
  }
  if (data.source_type !== undefined) {
    sets.push("source_type = ?");
    values.push(data.source_type);
  }
  if (data.source_id !== undefined) {
    sets.push("source_id = ?");
    values.push(data.source_id);
  }
  if (data.received_at !== undefined) {
    sets.push("received_at = ?");
    values.push(data.received_at);
  }
  if (data.processed_at !== undefined) {
    sets.push("processed_at = ?");
    values.push(data.processed_at);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE workflow_signals SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class WorkflowSignalsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): WorkflowSignals | null {
    return this.db.query<WorkflowSignals, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): WorkflowSignals[] {
    return this.db.query<WorkflowSignals, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: WorkflowSignalsInsert): WorkflowSignals {
    const { sql, params } = buildInsert(data);
    return this.db.query<WorkflowSignals, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: WorkflowSignalsUpdate, tenantId: string): WorkflowSignals | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<WorkflowSignals, unknown[]>(sql).get(...params) ?? null;
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