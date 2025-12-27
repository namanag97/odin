/**
 * Repository for knowledge_models
 * Source: 16_semantic.sql
 */

import { Database } from "bun:sqlite";
import type { KnowledgeModels, KnowledgeModelsInsert, KnowledgeModelsUpdate } from "../types/knowledge-models";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "knowledge_models";

const SELECT_BY_ID = "SELECT * FROM knowledge_models WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM knowledge_models WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM knowledge_models WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM knowledge_models`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: KnowledgeModelsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.package_id !== undefined) {
    columns.push("package_id");
    values.push(data.package_id);
    placeholders.push("?");
  }
  if (data.key !== undefined) {
    columns.push("key");
    values.push(data.key);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.data_model_id !== undefined) {
    columns.push("data_model_id");
    values.push(data.data_model_id);
    placeholders.push("?");
  }
  if (data.km_type !== undefined) {
    columns.push("km_type");
    values.push(data.km_type);
    placeholders.push("?");
  }
  if (data.extends_km_id !== undefined) {
    columns.push("extends_km_id");
    values.push(data.extends_km_id);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.version !== undefined) {
    columns.push("version");
    values.push(data.version);
    placeholders.push("?");
  }
  if (data.yaml_content !== undefined) {
    columns.push("yaml_content");
    values.push(data.yaml_content);
    placeholders.push("?");
  }
  if (data.published_at !== undefined) {
    columns.push("published_at");
    values.push(data.published_at);
    placeholders.push("?");
  }
  if (data.created_by !== undefined) {
    columns.push("created_by");
    values.push(data.created_by);
    placeholders.push("?");
  }

  const sql = `INSERT INTO knowledge_models (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: KnowledgeModelsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.package_id !== undefined) {
    sets.push("package_id = ?");
    values.push(data.package_id);
  }
  if (data.key !== undefined) {
    sets.push("key = ?");
    values.push(data.key);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.data_model_id !== undefined) {
    sets.push("data_model_id = ?");
    values.push(data.data_model_id);
  }
  if (data.km_type !== undefined) {
    sets.push("km_type = ?");
    values.push(data.km_type);
  }
  if (data.extends_km_id !== undefined) {
    sets.push("extends_km_id = ?");
    values.push(data.extends_km_id);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.version !== undefined) {
    sets.push("version = ?");
    values.push(data.version);
  }
  if (data.yaml_content !== undefined) {
    sets.push("yaml_content = ?");
    values.push(data.yaml_content);
  }
  if (data.published_at !== undefined) {
    sets.push("published_at = ?");
    values.push(data.published_at);
  }
  if (data.created_by !== undefined) {
    sets.push("created_by = ?");
    values.push(data.created_by);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE knowledge_models SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class KnowledgeModelsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): KnowledgeModels | null {
    return this.db.query<KnowledgeModels, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): KnowledgeModels[] {
    return this.db.query<KnowledgeModels, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: KnowledgeModelsInsert): KnowledgeModels {
    const { sql, params } = buildInsert(data);
    return this.db.query<KnowledgeModels, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: KnowledgeModelsUpdate, tenantId: string): KnowledgeModels | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<KnowledgeModels, unknown[]>(sql).get(...params) ?? null;
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