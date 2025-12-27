/**
 * Repository for metric_values
 * Source: 07_analytics.sql
 */

import { Database } from "bun:sqlite";
import type { MetricValues, MetricValuesInsert, MetricValuesUpdate } from "../types/metric-values";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "metric_values";

const SELECT_BY_ID = "SELECT * FROM metric_values WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM metric_values WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM metric_values WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM metric_values`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: MetricValuesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.metric_id !== undefined) {
    columns.push("metric_id");
    values.push(data.metric_id);
    placeholders.push("?");
  }
  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.measured_at !== undefined) {
    columns.push("measured_at");
    values.push(data.measured_at);
    placeholders.push("?");
  }
  if (data.period_start !== undefined) {
    columns.push("period_start");
    values.push(data.period_start);
    placeholders.push("?");
  }
  if (data.period_end !== undefined) {
    columns.push("period_end");
    values.push(data.period_end);
    placeholders.push("?");
  }
  if (data.value !== undefined) {
    columns.push("value");
    values.push(data.value);
    placeholders.push("?");
  }
  if (data.sample_count !== undefined) {
    columns.push("sample_count");
    values.push(data.sample_count);
    placeholders.push("?");
  }
  if (data.dimensions !== undefined) {
    columns.push("dimensions");
    values.push(JSON.stringify(data.dimensions));
    placeholders.push("?");
  }

  const sql = `INSERT INTO metric_values (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: MetricValuesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.metric_id !== undefined) {
    sets.push("metric_id = ?");
    values.push(data.metric_id);
  }
  if (data.measured_at !== undefined) {
    sets.push("measured_at = ?");
    values.push(data.measured_at);
  }
  if (data.period_start !== undefined) {
    sets.push("period_start = ?");
    values.push(data.period_start);
  }
  if (data.period_end !== undefined) {
    sets.push("period_end = ?");
    values.push(data.period_end);
  }
  if (data.value !== undefined) {
    sets.push("value = ?");
    values.push(data.value);
  }
  if (data.sample_count !== undefined) {
    sets.push("sample_count = ?");
    values.push(data.sample_count);
  }
  if (data.dimensions !== undefined) {
    sets.push("dimensions = ?");
    values.push(JSON.stringify(data.dimensions));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE metric_values SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class MetricValuesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): MetricValues | null {
    return this.db.query<MetricValues, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): MetricValues[] {
    return this.db.query<MetricValues, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: MetricValuesInsert): MetricValues {
    const { sql, params } = buildInsert(data);
    return this.db.query<MetricValues, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: MetricValuesUpdate, tenantId: string): MetricValues | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<MetricValues, unknown[]>(sql).get(...params) ?? null;
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