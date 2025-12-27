/**
 * Repository for copilot_messages
 * Source: 13_copilot.sql
 */

import { Database } from "bun:sqlite";
import type { CopilotMessages, CopilotMessagesInsert, CopilotMessagesUpdate } from "../types/copilot-messages";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "copilot_messages";

const SELECT_BY_ID = "SELECT * FROM copilot_messages WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM copilot_messages WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM copilot_messages WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM copilot_messages`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: CopilotMessagesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

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
  if (data.role !== undefined) {
    columns.push("role");
    values.push(data.role);
    placeholders.push("?");
  }
  if (data.content !== undefined) {
    columns.push("content");
    values.push(data.content);
    placeholders.push("?");
  }
  if (data.sequence !== undefined) {
    columns.push("sequence");
    values.push(data.sequence);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }
  if (data.token_count !== undefined) {
    columns.push("token_count");
    values.push(data.token_count);
    placeholders.push("?");
  }

  const sql = `INSERT INTO copilot_messages (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: CopilotMessagesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.session_id !== undefined) {
    sets.push("session_id = ?");
    values.push(data.session_id);
  }
  if (data.role !== undefined) {
    sets.push("role = ?");
    values.push(data.role);
  }
  if (data.content !== undefined) {
    sets.push("content = ?");
    values.push(data.content);
  }
  if (data.sequence !== undefined) {
    sets.push("sequence = ?");
    values.push(data.sequence);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }
  if (data.token_count !== undefined) {
    sets.push("token_count = ?");
    values.push(data.token_count);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE copilot_messages SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class CopilotMessagesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): CopilotMessages | null {
    return this.db.query<CopilotMessages, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): CopilotMessages[] {
    return this.db.query<CopilotMessages, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: CopilotMessagesInsert): CopilotMessages {
    const { sql, params } = buildInsert(data);
    return this.db.query<CopilotMessages, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: CopilotMessagesUpdate, tenantId: string): CopilotMessages | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<CopilotMessages, unknown[]>(sql).get(...params) ?? null;
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