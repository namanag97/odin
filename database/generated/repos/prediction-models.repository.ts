/**
 * Repository for prediction_models
 * Source: 08_prediction.sql
 */

import { Database } from "bun:sqlite";
import type { PredictionModels, PredictionModelsInsert, PredictionModelsUpdate } from "../types/prediction-models";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "prediction_models";

const SELECT_BY_ID = "SELECT * FROM prediction_models WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM prediction_models WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM prediction_models WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM prediction_models`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: PredictionModelsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
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
  if (data.prediction_type !== undefined) {
    columns.push("prediction_type");
    values.push(data.prediction_type);
    placeholders.push("?");
  }
  if (data.algorithm !== undefined) {
    columns.push("algorithm");
    values.push(data.algorithm);
    placeholders.push("?");
  }
  if (data.hyperparameters !== undefined) {
    columns.push("hyperparameters");
    values.push(JSON.stringify(data.hyperparameters));
    placeholders.push("?");
  }
  if (data.feature_ids !== undefined) {
    columns.push("feature_ids");
    values.push(data.feature_ids);
    placeholders.push("?");
  }
  if (data.model_binary !== undefined) {
    columns.push("model_binary");
    values.push(data.model_binary);
    placeholders.push("?");
  }
  if (data.model_file_path !== undefined) {
    columns.push("model_file_path");
    values.push(data.model_file_path);
    placeholders.push("?");
  }
  if (data.training_date !== undefined) {
    columns.push("training_date");
    values.push(data.training_date);
    placeholders.push("?");
  }
  if (data.training_samples !== undefined) {
    columns.push("training_samples");
    values.push(data.training_samples);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }

  const sql = `INSERT INTO prediction_models (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: PredictionModelsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.event_log_id !== undefined) {
    sets.push("event_log_id = ?");
    values.push(data.event_log_id);
  }
  if (data.data_pool_id !== undefined) {
    sets.push("data_pool_id = ?");
    values.push(data.data_pool_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.prediction_type !== undefined) {
    sets.push("prediction_type = ?");
    values.push(data.prediction_type);
  }
  if (data.algorithm !== undefined) {
    sets.push("algorithm = ?");
    values.push(data.algorithm);
  }
  if (data.hyperparameters !== undefined) {
    sets.push("hyperparameters = ?");
    values.push(JSON.stringify(data.hyperparameters));
  }
  if (data.feature_ids !== undefined) {
    sets.push("feature_ids = ?");
    values.push(data.feature_ids);
  }
  if (data.model_binary !== undefined) {
    sets.push("model_binary = ?");
    values.push(data.model_binary);
  }
  if (data.model_file_path !== undefined) {
    sets.push("model_file_path = ?");
    values.push(data.model_file_path);
  }
  if (data.training_date !== undefined) {
    sets.push("training_date = ?");
    values.push(data.training_date);
  }
  if (data.training_samples !== undefined) {
    sets.push("training_samples = ?");
    values.push(data.training_samples);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE prediction_models SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class PredictionModelsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): PredictionModels | null {
    return this.db.query<PredictionModels, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): PredictionModels[] {
    return this.db.query<PredictionModels, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: PredictionModelsInsert): PredictionModels {
    const { sql, params } = buildInsert(data);
    return this.db.query<PredictionModels, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: PredictionModelsUpdate, tenantId: string): PredictionModels | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<PredictionModels, unknown[]>(sql).get(...params) ?? null;
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