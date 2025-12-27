/**
 * Repository for quality_metrics
 * Source: 06_conformance.sql
 */

import { Database } from "bun:sqlite";
import type { QualityMetrics, QualityMetricsInsert, QualityMetricsUpdate } from "../types/quality-metrics";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "quality_metrics";

const SELECT_BY_ID = "SELECT * FROM quality_metrics WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM quality_metrics WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM quality_metrics WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM quality_metrics`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: QualityMetricsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.model_id !== undefined) {
    columns.push("model_id");
    values.push(data.model_id);
    placeholders.push("?");
  }
  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.computed_at !== undefined) {
    columns.push("computed_at");
    values.push(data.computed_at);
    placeholders.push("?");
  }
  if (data.metric_type !== undefined) {
    columns.push("metric_type");
    values.push(data.metric_type);
    placeholders.push("?");
  }
  if (data.value !== undefined) {
    columns.push("value");
    values.push(data.value);
    placeholders.push("?");
  }
  if (data.method !== undefined) {
    columns.push("method");
    values.push(data.method);
    placeholders.push("?");
  }
  if (data.sample_size !== undefined) {
    columns.push("sample_size");
    values.push(data.sample_size);
    placeholders.push("?");
  }
  if (data.confidence_interval !== undefined) {
    columns.push("confidence_interval");
    values.push(data.confidence_interval);
    placeholders.push("?");
  }

  const sql = `INSERT INTO quality_metrics (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: QualityMetricsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.model_id !== undefined) {
    sets.push("model_id = ?");
    values.push(data.model_id);
  }
  if (data.computed_at !== undefined) {
    sets.push("computed_at = ?");
    values.push(data.computed_at);
  }
  if (data.metric_type !== undefined) {
    sets.push("metric_type = ?");
    values.push(data.metric_type);
  }
  if (data.value !== undefined) {
    sets.push("value = ?");
    values.push(data.value);
  }
  if (data.method !== undefined) {
    sets.push("method = ?");
    values.push(data.method);
  }
  if (data.sample_size !== undefined) {
    sets.push("sample_size = ?");
    values.push(data.sample_size);
  }
  if (data.confidence_interval !== undefined) {
    sets.push("confidence_interval = ?");
    values.push(data.confidence_interval);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE quality_metrics SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class QualityMetricsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): QualityMetrics | null {
    return this.db.query<QualityMetrics, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): QualityMetrics[] {
    return this.db.query<QualityMetrics, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: QualityMetricsInsert): QualityMetrics {
    const { sql, params } = buildInsert(data);
    return this.db.query<QualityMetrics, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: QualityMetricsUpdate, tenantId: string): QualityMetrics | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<QualityMetrics, unknown[]>(sql).get(...params) ?? null;
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