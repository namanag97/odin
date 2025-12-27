/**
 * Repository for predictions
 * Source: 08_prediction.sql
 */

import { Database } from "bun:sqlite";
import type { Predictions, PredictionsInsert, PredictionsUpdate } from "../types/predictions";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "predictions";

const SELECT_BY_ID = "SELECT * FROM predictions WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM predictions WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM predictions WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM predictions`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: PredictionsInsert): { sql: string; params: unknown[] } {
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
  if (data.case_id !== undefined) {
    columns.push("case_id");
    values.push(data.case_id);
    placeholders.push("?");
  }
  if (data.predicted_at !== undefined) {
    columns.push("predicted_at");
    values.push(data.predicted_at);
    placeholders.push("?");
  }
  if (data.input_features !== undefined) {
    columns.push("input_features");
    values.push(data.input_features);
    placeholders.push("?");
  }
  if (data.prediction_value !== undefined) {
    columns.push("prediction_value");
    values.push(data.prediction_value);
    placeholders.push("?");
  }
  if (data.confidence !== undefined) {
    columns.push("confidence");
    values.push(data.confidence);
    placeholders.push("?");
  }
  if (data.probabilities !== undefined) {
    columns.push("probabilities");
    values.push(data.probabilities);
    placeholders.push("?");
  }
  if (data.actual_value !== undefined) {
    columns.push("actual_value");
    values.push(data.actual_value);
    placeholders.push("?");
  }
  if (data.is_correct !== undefined) {
    columns.push("is_correct");
    values.push(data.is_correct);
    placeholders.push("?");
  }

  const sql = `INSERT INTO predictions (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: PredictionsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.prediction_model_id !== undefined) {
    sets.push("prediction_model_id = ?");
    values.push(data.prediction_model_id);
  }
  if (data.case_id !== undefined) {
    sets.push("case_id = ?");
    values.push(data.case_id);
  }
  if (data.predicted_at !== undefined) {
    sets.push("predicted_at = ?");
    values.push(data.predicted_at);
  }
  if (data.input_features !== undefined) {
    sets.push("input_features = ?");
    values.push(data.input_features);
  }
  if (data.prediction_value !== undefined) {
    sets.push("prediction_value = ?");
    values.push(data.prediction_value);
  }
  if (data.confidence !== undefined) {
    sets.push("confidence = ?");
    values.push(data.confidence);
  }
  if (data.probabilities !== undefined) {
    sets.push("probabilities = ?");
    values.push(data.probabilities);
  }
  if (data.actual_value !== undefined) {
    sets.push("actual_value = ?");
    values.push(data.actual_value);
  }
  if (data.is_correct !== undefined) {
    sets.push("is_correct = ?");
    values.push(data.is_correct);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE predictions SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class PredictionsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Predictions | null {
    return this.db.query<Predictions, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Predictions[] {
    return this.db.query<Predictions, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: PredictionsInsert): Predictions {
    const { sql, params } = buildInsert(data);
    return this.db.query<Predictions, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: PredictionsUpdate, tenantId: string): Predictions | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Predictions, unknown[]>(sql).get(...params) ?? null;
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