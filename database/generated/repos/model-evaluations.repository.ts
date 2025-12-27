/**
 * Repository for model_evaluations
 * Source: 08_prediction.sql
 */

import { Database } from "bun:sqlite";
import type { ModelEvaluations, ModelEvaluationsInsert, ModelEvaluationsUpdate } from "../types/model-evaluations";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "model_evaluations";

const SELECT_BY_ID = "SELECT * FROM model_evaluations WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM model_evaluations WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM model_evaluations WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM model_evaluations`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ModelEvaluationsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.prediction_model_id !== undefined) {
    columns.push("prediction_model_id");
    values.push(data.prediction_model_id);
    placeholders.push("?");
  }
  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.evaluated_at !== undefined) {
    columns.push("evaluated_at");
    values.push(data.evaluated_at);
    placeholders.push("?");
  }
  if (data.evaluation_type !== undefined) {
    columns.push("evaluation_type");
    values.push(data.evaluation_type);
    placeholders.push("?");
  }
  if (data.sample_size !== undefined) {
    columns.push("sample_size");
    values.push(data.sample_size);
    placeholders.push("?");
  }
  if (data.metrics !== undefined) {
    columns.push("metrics");
    values.push(data.metrics);
    placeholders.push("?");
  }

  const sql = `INSERT INTO model_evaluations (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ModelEvaluationsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.prediction_model_id !== undefined) {
    sets.push("prediction_model_id = ?");
    values.push(data.prediction_model_id);
  }
  if (data.evaluated_at !== undefined) {
    sets.push("evaluated_at = ?");
    values.push(data.evaluated_at);
  }
  if (data.evaluation_type !== undefined) {
    sets.push("evaluation_type = ?");
    values.push(data.evaluation_type);
  }
  if (data.sample_size !== undefined) {
    sets.push("sample_size = ?");
    values.push(data.sample_size);
  }
  if (data.metrics !== undefined) {
    sets.push("metrics = ?");
    values.push(data.metrics);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE model_evaluations SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ModelEvaluationsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ModelEvaluations | null {
    return this.db.query<ModelEvaluations, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ModelEvaluations[] {
    return this.db.query<ModelEvaluations, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ModelEvaluationsInsert): ModelEvaluations {
    const { sql, params } = buildInsert(data);
    return this.db.query<ModelEvaluations, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ModelEvaluationsUpdate, tenantId: string): ModelEvaluations | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ModelEvaluations, unknown[]>(sql).get(...params) ?? null;
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