/**
 * Repository for copilot_tool_calls
 * Source: 13_copilot.sql
 */

import { Database } from "bun:sqlite";
import type { CopilotToolCalls, CopilotToolCallsInsert, CopilotToolCallsUpdate } from "../types/copilot-tool-calls";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "copilot_tool_calls";

const SELECT_BY_ID = "SELECT * FROM copilot_tool_calls WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM copilot_tool_calls WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM copilot_tool_calls WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM copilot_tool_calls`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: CopilotToolCallsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.message_id !== undefined) {
    columns.push("message_id");
    values.push(data.message_id);
    placeholders.push("?");
  }
  if (data.session_id !== undefined) {
    columns.push("session_id");
    values.push(data.session_id);
    placeholders.push("?");
  }
  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.tool_name !== undefined) {
    columns.push("tool_name");
    values.push(data.tool_name);
    placeholders.push("?");
  }
  if (data.tool_input !== undefined) {
    columns.push("tool_input");
    values.push(data.tool_input);
    placeholders.push("?");
  }
  if (data.tool_output !== undefined) {
    columns.push("tool_output");
    values.push(data.tool_output);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
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
  if (data.completed_at !== undefined) {
    columns.push("completed_at");
    values.push(data.completed_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO copilot_tool_calls (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: CopilotToolCallsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.message_id !== undefined) {
    sets.push("message_id = ?");
    values.push(data.message_id);
  }
  if (data.session_id !== undefined) {
    sets.push("session_id = ?");
    values.push(data.session_id);
  }
  if (data.tool_name !== undefined) {
    sets.push("tool_name = ?");
    values.push(data.tool_name);
  }
  if (data.tool_input !== undefined) {
    sets.push("tool_input = ?");
    values.push(data.tool_input);
  }
  if (data.tool_output !== undefined) {
    sets.push("tool_output = ?");
    values.push(data.tool_output);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.error_message !== undefined) {
    sets.push("error_message = ?");
    values.push(data.error_message);
  }
  if (data.execution_time_ms !== undefined) {
    sets.push("execution_time_ms = ?");
    values.push(data.execution_time_ms);
  }
  if (data.completed_at !== undefined) {
    sets.push("completed_at = ?");
    values.push(data.completed_at);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE copilot_tool_calls SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class CopilotToolCallsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): CopilotToolCalls | null {
    return this.db.query<CopilotToolCalls, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): CopilotToolCalls[] {
    return this.db.query<CopilotToolCalls, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: CopilotToolCallsInsert): CopilotToolCalls {
    const { sql, params } = buildInsert(data);
    return this.db.query<CopilotToolCalls, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: CopilotToolCallsUpdate, tenantId: string): CopilotToolCalls | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<CopilotToolCalls, unknown[]>(sql).get(...params) ?? null;
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