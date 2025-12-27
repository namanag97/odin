/**
 * Repository for sna_results
 * Source: 07_analytics.sql
 */

import { Database } from "bun:sqlite";
import type { SnaResults, SnaResultsInsert, SnaResultsUpdate } from "../types/sna-results";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "sna_results";

const SELECT_BY_ID = "SELECT * FROM sna_results WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM sna_results WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM sna_results WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM sna_results`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: SnaResultsInsert): { sql: string; params: unknown[] } {
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
  if (data.analysis_type !== undefined) {
    columns.push("analysis_type");
    values.push(data.analysis_type);
    placeholders.push("?");
  }
  if (data.network_data !== undefined) {
    columns.push("network_data");
    values.push(data.network_data);
    placeholders.push("?");
  }
  if (data.metrics !== undefined) {
    columns.push("metrics");
    values.push(JSON.stringify(data.metrics));
    placeholders.push("?");
  }

  const sql = `INSERT INTO sna_results (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: SnaResultsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.event_log_id !== undefined) {
    sets.push("event_log_id = ?");
    values.push(data.event_log_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.analyzed_at !== undefined) {
    sets.push("analyzed_at = ?");
    values.push(data.analyzed_at);
  }
  if (data.analysis_type !== undefined) {
    sets.push("analysis_type = ?");
    values.push(data.analysis_type);
  }
  if (data.network_data !== undefined) {
    sets.push("network_data = ?");
    values.push(data.network_data);
  }
  if (data.metrics !== undefined) {
    sets.push("metrics = ?");
    values.push(JSON.stringify(data.metrics));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE sna_results SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class SnaResultsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): SnaResults | null {
    return this.db.query<SnaResults, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): SnaResults[] {
    return this.db.query<SnaResults, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: SnaResultsInsert): SnaResults {
    const { sql, params } = buildInsert(data);
    return this.db.query<SnaResults, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: SnaResultsUpdate, tenantId: string): SnaResults | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<SnaResults, unknown[]>(sql).get(...params) ?? null;
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