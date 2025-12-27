/**
 * Repository for copilot_feedback
 * Source: 13_copilot.sql
 */

import { Database } from "bun:sqlite";
import type { CopilotFeedback, CopilotFeedbackInsert, CopilotFeedbackUpdate } from "../types/copilot-feedback";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "copilot_feedback";

const SELECT_BY_ID = "SELECT * FROM copilot_feedback WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM copilot_feedback WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM copilot_feedback WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM copilot_feedback`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: CopilotFeedbackInsert): { sql: string; params: unknown[] } {
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
  if (data.user_id !== undefined) {
    columns.push("user_id");
    values.push(data.user_id);
    placeholders.push("?");
  }
  if (data.rating !== undefined) {
    columns.push("rating");
    values.push(data.rating);
    placeholders.push("?");
  }
  if (data.feedback_type !== undefined) {
    columns.push("feedback_type");
    values.push(data.feedback_type);
    placeholders.push("?");
  }
  if (data.comment !== undefined) {
    columns.push("comment");
    values.push(data.comment);
    placeholders.push("?");
  }
  if (data.correction !== undefined) {
    columns.push("correction");
    values.push(data.correction);
    placeholders.push("?");
  }

  const sql = `INSERT INTO copilot_feedback (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: CopilotFeedbackUpdate, tenantId: string): { sql: string; params: unknown[] } {
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
  if (data.user_id !== undefined) {
    sets.push("user_id = ?");
    values.push(data.user_id);
  }
  if (data.rating !== undefined) {
    sets.push("rating = ?");
    values.push(data.rating);
  }
  if (data.feedback_type !== undefined) {
    sets.push("feedback_type = ?");
    values.push(data.feedback_type);
  }
  if (data.comment !== undefined) {
    sets.push("comment = ?");
    values.push(data.comment);
  }
  if (data.correction !== undefined) {
    sets.push("correction = ?");
    values.push(data.correction);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE copilot_feedback SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class CopilotFeedbackRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): CopilotFeedback | null {
    return this.db.query<CopilotFeedback, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): CopilotFeedback[] {
    return this.db.query<CopilotFeedback, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: CopilotFeedbackInsert): CopilotFeedback {
    const { sql, params } = buildInsert(data);
    return this.db.query<CopilotFeedback, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: CopilotFeedbackUpdate, tenantId: string): CopilotFeedback | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<CopilotFeedback, unknown[]>(sql).get(...params) ?? null;
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