/**
 * Repository for prediction_features
 * Source: 08_prediction.sql
 */

import { Database } from "bun:sqlite";
import type { PredictionFeatures, PredictionFeaturesInsert, PredictionFeaturesUpdate } from "../types/prediction-features";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "prediction_features";

const SELECT_BY_ID = "SELECT * FROM prediction_features WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM prediction_features WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM prediction_features WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM prediction_features`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: PredictionFeaturesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
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
  if (data.feature_type !== undefined) {
    columns.push("feature_type");
    values.push(data.feature_type);
    placeholders.push("?");
  }
  if (data.data_type !== undefined) {
    columns.push("data_type");
    values.push(data.data_type);
    placeholders.push("?");
  }
  if (data.source_column !== undefined) {
    columns.push("source_column");
    values.push(data.source_column);
    placeholders.push("?");
  }
  if (data.derivation_formula !== undefined) {
    columns.push("derivation_formula");
    values.push(data.derivation_formula);
    placeholders.push("?");
  }
  if (data.encoding_method !== undefined) {
    columns.push("encoding_method");
    values.push(data.encoding_method);
    placeholders.push("?");
  }
  if (data.normalization !== undefined) {
    columns.push("normalization");
    values.push(data.normalization);
    placeholders.push("?");
  }
  if (data.missing_strategy !== undefined) {
    columns.push("missing_strategy");
    values.push(data.missing_strategy);
    placeholders.push("?");
  }
  if (data.statistics !== undefined) {
    columns.push("statistics");
    values.push(JSON.stringify(data.statistics));
    placeholders.push("?");
  }

  const sql = `INSERT INTO prediction_features (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: PredictionFeaturesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.feature_type !== undefined) {
    sets.push("feature_type = ?");
    values.push(data.feature_type);
  }
  if (data.data_type !== undefined) {
    sets.push("data_type = ?");
    values.push(data.data_type);
  }
  if (data.source_column !== undefined) {
    sets.push("source_column = ?");
    values.push(data.source_column);
  }
  if (data.derivation_formula !== undefined) {
    sets.push("derivation_formula = ?");
    values.push(data.derivation_formula);
  }
  if (data.encoding_method !== undefined) {
    sets.push("encoding_method = ?");
    values.push(data.encoding_method);
  }
  if (data.normalization !== undefined) {
    sets.push("normalization = ?");
    values.push(data.normalization);
  }
  if (data.missing_strategy !== undefined) {
    sets.push("missing_strategy = ?");
    values.push(data.missing_strategy);
  }
  if (data.statistics !== undefined) {
    sets.push("statistics = ?");
    values.push(JSON.stringify(data.statistics));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE prediction_features SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class PredictionFeaturesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): PredictionFeatures | null {
    return this.db.query<PredictionFeatures, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): PredictionFeatures[] {
    return this.db.query<PredictionFeatures, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: PredictionFeaturesInsert): PredictionFeatures {
    const { sql, params } = buildInsert(data);
    return this.db.query<PredictionFeatures, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: PredictionFeaturesUpdate, tenantId: string): PredictionFeatures | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<PredictionFeatures, unknown[]>(sql).get(...params) ?? null;
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