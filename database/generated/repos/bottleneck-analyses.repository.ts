/**
 * Repository for bottleneck_analyses
 * Source: 07_analytics.sql
 */

import { Database } from "bun:sqlite";
import type { BottleneckAnalyses, BottleneckAnalysesInsert, BottleneckAnalysesUpdate } from "../types/bottleneck-analyses";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "bottleneck_analyses";

const SELECT_BY_ID = "SELECT * FROM bottleneck_analyses WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM bottleneck_analyses WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM bottleneck_analyses WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM bottleneck_analyses`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: BottleneckAnalysesInsert): { sql: string; params: unknown[] } {
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
  if (data.analyzed_at !== undefined) {
    columns.push("analyzed_at");
    values.push(data.analyzed_at);
    placeholders.push("?");
  }
  if (data.method !== undefined) {
    columns.push("method");
    values.push(data.method);
    placeholders.push("?");
  }
  if (data.results !== undefined) {
    columns.push("results");
    values.push(data.results);
    placeholders.push("?");
  }
  if (data.recommendations !== undefined) {
    columns.push("recommendations");
    values.push(JSON.stringify(data.recommendations));
    placeholders.push("?");
  }

  const sql = `INSERT INTO bottleneck_analyses (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: BottleneckAnalysesUpdate, tenantId: string): { sql: string; params: unknown[] } {
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
  if (data.analyzed_at !== undefined) {
    sets.push("analyzed_at = ?");
    values.push(data.analyzed_at);
  }
  if (data.method !== undefined) {
    sets.push("method = ?");
    values.push(data.method);
  }
  if (data.results !== undefined) {
    sets.push("results = ?");
    values.push(data.results);
  }
  if (data.recommendations !== undefined) {
    sets.push("recommendations = ?");
    values.push(JSON.stringify(data.recommendations));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE bottleneck_analyses SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class BottleneckAnalysesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): BottleneckAnalyses | null {
    return this.db.query<BottleneckAnalyses, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): BottleneckAnalyses[] {
    return this.db.query<BottleneckAnalyses, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: BottleneckAnalysesInsert): BottleneckAnalyses {
    const { sql, params } = buildInsert(data);
    return this.db.query<BottleneckAnalyses, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: BottleneckAnalysesUpdate, tenantId: string): BottleneckAnalyses | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<BottleneckAnalyses, unknown[]>(sql).get(...params) ?? null;
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