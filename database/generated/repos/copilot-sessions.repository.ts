/**
 * Repository for copilot_sessions
 * Source: 13_copilot.sql
 */

import { Database } from "bun:sqlite";
import type { CopilotSessions, CopilotSessionsInsert, CopilotSessionsUpdate } from "../types/copilot-sessions";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "copilot_sessions";

const SELECT_BY_ID = "SELECT * FROM copilot_sessions WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM copilot_sessions WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM copilot_sessions WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM copilot_sessions`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: CopilotSessionsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.user_id !== undefined) {
    columns.push("user_id");
    values.push(data.user_id);
    placeholders.push("?");
  }
  if (data.event_log_id !== undefined) {
    columns.push("event_log_id");
    values.push(data.event_log_id);
    placeholders.push("?");
  }
  if (data.data_pool_id !== undefined) {
    columns.push("data_pool_id");
    values.push(data.data_pool_id);
    placeholders.push("?");
  }
  if (data.memory_type !== undefined) {
    columns.push("memory_type");
    values.push(data.memory_type);
    placeholders.push("?");
  }
  if (data.max_tokens !== undefined) {
    columns.push("max_tokens");
    values.push(data.max_tokens);
    placeholders.push("?");
  }
  if (data.window_size !== undefined) {
    columns.push("window_size");
    values.push(data.window_size);
    placeholders.push("?");
  }
  if (data.title !== undefined) {
    columns.push("title");
    values.push(data.title);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.last_message_at !== undefined) {
    columns.push("last_message_at");
    values.push(data.last_message_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO copilot_sessions (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: CopilotSessionsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.user_id !== undefined) {
    sets.push("user_id = ?");
    values.push(data.user_id);
  }
  if (data.event_log_id !== undefined) {
    sets.push("event_log_id = ?");
    values.push(data.event_log_id);
  }
  if (data.data_pool_id !== undefined) {
    sets.push("data_pool_id = ?");
    values.push(data.data_pool_id);
  }
  if (data.memory_type !== undefined) {
    sets.push("memory_type = ?");
    values.push(data.memory_type);
  }
  if (data.max_tokens !== undefined) {
    sets.push("max_tokens = ?");
    values.push(data.max_tokens);
  }
  if (data.window_size !== undefined) {
    sets.push("window_size = ?");
    values.push(data.window_size);
  }
  if (data.title !== undefined) {
    sets.push("title = ?");
    values.push(data.title);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.last_message_at !== undefined) {
    sets.push("last_message_at = ?");
    values.push(data.last_message_at);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE copilot_sessions SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class CopilotSessionsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): CopilotSessions | null {
    return this.db.query<CopilotSessions, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): CopilotSessions[] {
    return this.db.query<CopilotSessions, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: CopilotSessionsInsert): CopilotSessions {
    const { sql, params } = buildInsert(data);
    return this.db.query<CopilotSessions, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: CopilotSessionsUpdate, tenantId: string): CopilotSessions | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<CopilotSessions, unknown[]>(sql).get(...params) ?? null;
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