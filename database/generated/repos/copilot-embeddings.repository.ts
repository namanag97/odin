/**
 * Repository for copilot_embeddings
 * Source: 13_copilot.sql
 */

import { Database } from "bun:sqlite";
import type { CopilotEmbeddings, CopilotEmbeddingsInsert, CopilotEmbeddingsUpdate } from "../types/copilot-embeddings";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "copilot_embeddings";

const SELECT_BY_ID = "SELECT * FROM copilot_embeddings WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM copilot_embeddings WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM copilot_embeddings WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM copilot_embeddings`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: CopilotEmbeddingsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
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
  if (data.content !== undefined) {
    columns.push("content");
    values.push(data.content);
    placeholders.push("?");
  }
  if (data.chunk_index !== undefined) {
    columns.push("chunk_index");
    values.push(data.chunk_index);
    placeholders.push("?");
  }
  if (data.embedding !== undefined) {
    columns.push("embedding");
    values.push(data.embedding);
    placeholders.push("?");
  }
  if (data.embedding_model !== undefined) {
    columns.push("embedding_model");
    values.push(data.embedding_model);
    placeholders.push("?");
  }
  if (data.embedding_dimensions !== undefined) {
    columns.push("embedding_dimensions");
    values.push(data.embedding_dimensions);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO copilot_embeddings (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: CopilotEmbeddingsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.source_type !== undefined) {
    sets.push("source_type = ?");
    values.push(data.source_type);
  }
  if (data.source_id !== undefined) {
    sets.push("source_id = ?");
    values.push(data.source_id);
  }
  if (data.content !== undefined) {
    sets.push("content = ?");
    values.push(data.content);
  }
  if (data.chunk_index !== undefined) {
    sets.push("chunk_index = ?");
    values.push(data.chunk_index);
  }
  if (data.embedding !== undefined) {
    sets.push("embedding = ?");
    values.push(data.embedding);
  }
  if (data.embedding_model !== undefined) {
    sets.push("embedding_model = ?");
    values.push(data.embedding_model);
  }
  if (data.embedding_dimensions !== undefined) {
    sets.push("embedding_dimensions = ?");
    values.push(data.embedding_dimensions);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE copilot_embeddings SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class CopilotEmbeddingsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): CopilotEmbeddings | null {
    return this.db.query<CopilotEmbeddings, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): CopilotEmbeddings[] {
    return this.db.query<CopilotEmbeddings, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: CopilotEmbeddingsInsert): CopilotEmbeddings {
    const { sql, params } = buildInsert(data);
    return this.db.query<CopilotEmbeddings, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: CopilotEmbeddingsUpdate, tenantId: string): CopilotEmbeddings | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<CopilotEmbeddings, unknown[]>(sql).get(...params) ?? null;
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