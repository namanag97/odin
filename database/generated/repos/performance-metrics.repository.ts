/**
 * Repository for performance_metrics
 * Source: 07_analytics.sql
 */

import { Database } from "bun:sqlite";
import type { PerformanceMetrics, PerformanceMetricsInsert, PerformanceMetricsUpdate } from "../types/performance-metrics";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "performance_metrics";

const SELECT_BY_ID = "SELECT * FROM performance_metrics WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM performance_metrics WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM performance_metrics WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM performance_metrics`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: PerformanceMetricsInsert): { sql: string; params: unknown[] } {
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
  if (data.metric_type !== undefined) {
    columns.push("metric_type");
    values.push(data.metric_type);
    placeholders.push("?");
  }
  if (data.aggregation !== undefined) {
    columns.push("aggregation");
    values.push(data.aggregation);
    placeholders.push("?");
  }
  if (data.unit !== undefined) {
    columns.push("unit");
    values.push(data.unit);
    placeholders.push("?");
  }
  if (data.formula !== undefined) {
    columns.push("formula");
    values.push(data.formula);
    placeholders.push("?");
  }
  if (data.filter_conditions !== undefined) {
    columns.push("filter_conditions");
    values.push(JSON.stringify(data.filter_conditions));
    placeholders.push("?");
  }
  if (data.thresholds !== undefined) {
    columns.push("thresholds");
    values.push(JSON.stringify(data.thresholds));
    placeholders.push("?");
  }
  if (data.is_active !== undefined) {
    columns.push("is_active");
    values.push(data.is_active);
    placeholders.push("?");
  }

  const sql = `INSERT INTO performance_metrics (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: PerformanceMetricsUpdate, tenantId: string): { sql: string; params: unknown[] } {
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
  if (data.metric_type !== undefined) {
    sets.push("metric_type = ?");
    values.push(data.metric_type);
  }
  if (data.aggregation !== undefined) {
    sets.push("aggregation = ?");
    values.push(data.aggregation);
  }
  if (data.unit !== undefined) {
    sets.push("unit = ?");
    values.push(data.unit);
  }
  if (data.formula !== undefined) {
    sets.push("formula = ?");
    values.push(data.formula);
  }
  if (data.filter_conditions !== undefined) {
    sets.push("filter_conditions = ?");
    values.push(JSON.stringify(data.filter_conditions));
  }
  if (data.thresholds !== undefined) {
    sets.push("thresholds = ?");
    values.push(JSON.stringify(data.thresholds));
  }
  if (data.is_active !== undefined) {
    sets.push("is_active = ?");
    values.push(data.is_active);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE performance_metrics SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class PerformanceMetricsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): PerformanceMetrics | null {
    return this.db.query<PerformanceMetrics, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): PerformanceMetrics[] {
    return this.db.query<PerformanceMetrics, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: PerformanceMetricsInsert): PerformanceMetrics {
    const { sql, params } = buildInsert(data);
    return this.db.query<PerformanceMetrics, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: PerformanceMetricsUpdate, tenantId: string): PerformanceMetrics | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<PerformanceMetrics, unknown[]>(sql).get(...params) ?? null;
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