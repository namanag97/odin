/**
 * Repository for incomplete_executions
 * Source: 18_automation_enhanced.sql
 */

import { Database } from "bun:sqlite";
import type { IncompleteExecutions, IncompleteExecutionsInsert, IncompleteExecutionsUpdate } from "../types/incomplete-executions";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "incomplete_executions";

const SELECT_BY_ID = "SELECT * FROM incomplete_executions WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM incomplete_executions WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM incomplete_executions WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM incomplete_executions`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: IncompleteExecutionsInsert): { sql: string; params: unknown[] } {
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
  if (data.execution_id !== undefined) {
    columns.push("execution_id");
    values.push(data.execution_id);
    placeholders.push("?");
  }
  if (data.failed_module_id !== undefined) {
    columns.push("failed_module_id");
    values.push(data.failed_module_id);
    placeholders.push("?");
  }
  if (data.error_message !== undefined) {
    columns.push("error_message");
    values.push(data.error_message);
    placeholders.push("?");
  }
  if (data.error_type !== undefined) {
    columns.push("error_type");
    values.push(data.error_type);
    placeholders.push("?");
  }
  if (data.bundle_data !== undefined) {
    columns.push("bundle_data");
    values.push(data.bundle_data);
    placeholders.push("?");
  }
  if (data.remaining_flow !== undefined) {
    columns.push("remaining_flow");
    values.push(data.remaining_flow);
    placeholders.push("?");
  }
  if (data.retry_count !== undefined) {
    columns.push("retry_count");
    values.push(data.retry_count);
    placeholders.push("?");
  }
  if (data.max_retries !== undefined) {
    columns.push("max_retries");
    values.push(data.max_retries);
    placeholders.push("?");
  }
  if (data.next_retry_at !== undefined) {
    columns.push("next_retry_at");
    values.push(data.next_retry_at);
    placeholders.push("?");
  }
  if (data.retry_delay_seconds !== undefined) {
    columns.push("retry_delay_seconds");
    values.push(data.retry_delay_seconds);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.resolved_at !== undefined) {
    columns.push("resolved_at");
    values.push(data.resolved_at);
    placeholders.push("?");
  }
  if (data.resolved_by !== undefined) {
    columns.push("resolved_by");
    values.push(data.resolved_by);
    placeholders.push("?");
  }
  if (data.resolution_type !== undefined) {
    columns.push("resolution_type");
    values.push(data.resolution_type);
    placeholders.push("?");
  }

  const sql = `INSERT INTO incomplete_executions (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: IncompleteExecutionsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.action_flow_id !== undefined) {
    sets.push("action_flow_id = ?");
    values.push(data.action_flow_id);
  }
  if (data.execution_id !== undefined) {
    sets.push("execution_id = ?");
    values.push(data.execution_id);
  }
  if (data.failed_module_id !== undefined) {
    sets.push("failed_module_id = ?");
    values.push(data.failed_module_id);
  }
  if (data.error_message !== undefined) {
    sets.push("error_message = ?");
    values.push(data.error_message);
  }
  if (data.error_type !== undefined) {
    sets.push("error_type = ?");
    values.push(data.error_type);
  }
  if (data.bundle_data !== undefined) {
    sets.push("bundle_data = ?");
    values.push(data.bundle_data);
  }
  if (data.remaining_flow !== undefined) {
    sets.push("remaining_flow = ?");
    values.push(data.remaining_flow);
  }
  if (data.retry_count !== undefined) {
    sets.push("retry_count = ?");
    values.push(data.retry_count);
  }
  if (data.max_retries !== undefined) {
    sets.push("max_retries = ?");
    values.push(data.max_retries);
  }
  if (data.next_retry_at !== undefined) {
    sets.push("next_retry_at = ?");
    values.push(data.next_retry_at);
  }
  if (data.retry_delay_seconds !== undefined) {
    sets.push("retry_delay_seconds = ?");
    values.push(data.retry_delay_seconds);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.resolved_at !== undefined) {
    sets.push("resolved_at = ?");
    values.push(data.resolved_at);
  }
  if (data.resolved_by !== undefined) {
    sets.push("resolved_by = ?");
    values.push(data.resolved_by);
  }
  if (data.resolution_type !== undefined) {
    sets.push("resolution_type = ?");
    values.push(data.resolution_type);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE incomplete_executions SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class IncompleteExecutionsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): IncompleteExecutions | null {
    return this.db.query<IncompleteExecutions, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): IncompleteExecutions[] {
    return this.db.query<IncompleteExecutions, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: IncompleteExecutionsInsert): IncompleteExecutions {
    const { sql, params } = buildInsert(data);
    return this.db.query<IncompleteExecutions, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: IncompleteExecutionsUpdate, tenantId: string): IncompleteExecutions | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<IncompleteExecutions, unknown[]>(sql).get(...params) ?? null;
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