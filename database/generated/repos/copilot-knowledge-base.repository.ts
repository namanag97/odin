/**
 * Repository for copilot_knowledge_base
 * Source: 13_copilot.sql
 */

import { Database } from "bun:sqlite";
import type { CopilotKnowledgeBase, CopilotKnowledgeBaseInsert, CopilotKnowledgeBaseUpdate } from "../types/copilot-knowledge-base";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "copilot_knowledge_base";

const SELECT_BY_ID = "SELECT * FROM copilot_knowledge_base WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM copilot_knowledge_base WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM copilot_knowledge_base WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM copilot_knowledge_base`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: CopilotKnowledgeBaseInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.title !== undefined) {
    columns.push("title");
    values.push(data.title);
    placeholders.push("?");
  }
  if (data.category !== undefined) {
    columns.push("category");
    values.push(data.category);
    placeholders.push("?");
  }
  if (data.content !== undefined) {
    columns.push("content");
    values.push(data.content);
    placeholders.push("?");
  }
  if (data.content_type !== undefined) {
    columns.push("content_type");
    values.push(data.content_type);
    placeholders.push("?");
  }
  if (data.version !== undefined) {
    columns.push("version");
    values.push(data.version);
    placeholders.push("?");
  }
  if (data.is_active !== undefined) {
    columns.push("is_active");
    values.push(data.is_active);
    placeholders.push("?");
  }

  const sql = `INSERT INTO copilot_knowledge_base (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: CopilotKnowledgeBaseUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.title !== undefined) {
    sets.push("title = ?");
    values.push(data.title);
  }
  if (data.category !== undefined) {
    sets.push("category = ?");
    values.push(data.category);
  }
  if (data.content !== undefined) {
    sets.push("content = ?");
    values.push(data.content);
  }
  if (data.content_type !== undefined) {
    sets.push("content_type = ?");
    values.push(data.content_type);
  }
  if (data.version !== undefined) {
    sets.push("version = ?");
    values.push(data.version);
  }
  if (data.is_active !== undefined) {
    sets.push("is_active = ?");
    values.push(data.is_active);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE copilot_knowledge_base SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class CopilotKnowledgeBaseRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): CopilotKnowledgeBase | null {
    return this.db.query<CopilotKnowledgeBase, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): CopilotKnowledgeBase[] {
    return this.db.query<CopilotKnowledgeBase, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: CopilotKnowledgeBaseInsert): CopilotKnowledgeBase {
    const { sql, params } = buildInsert(data);
    return this.db.query<CopilotKnowledgeBase, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: CopilotKnowledgeBaseUpdate, tenantId: string): CopilotKnowledgeBase | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<CopilotKnowledgeBase, unknown[]>(sql).get(...params) ?? null;
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