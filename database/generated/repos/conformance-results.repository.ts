/**
 * Repository for conformance_results
 * Source: 06_conformance.sql
 */

import { Database } from "bun:sqlite";
import type { ConformanceResults, ConformanceResultsInsert, ConformanceResultsUpdate } from "../types/conformance-results";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "conformance_results";

const SELECT_BY_ID = "SELECT * FROM conformance_results WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM conformance_results WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM conformance_results WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM conformance_results`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ConformanceResultsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.conformance_job_id !== undefined) {
    columns.push("conformance_job_id");
    values.push(data.conformance_job_id);
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
  if (data.cases_checked !== undefined) {
    columns.push("cases_checked");
    values.push(data.cases_checked);
    placeholders.push("?");
  }
  if (data.conforming_cases !== undefined) {
    columns.push("conforming_cases");
    values.push(data.conforming_cases);
    placeholders.push("?");
  }
  if (data.non_conforming_cases !== undefined) {
    columns.push("non_conforming_cases");
    values.push(data.non_conforming_cases);
    placeholders.push("?");
  }
  if (data.fitness !== undefined) {
    columns.push("fitness");
    values.push(data.fitness);
    placeholders.push("?");
  }
  if (data.precision !== undefined) {
    columns.push("precision");
    values.push(data.precision);
    placeholders.push("?");
  }
  if (data.generalization !== undefined) {
    columns.push("generalization");
    values.push(data.generalization);
    placeholders.push("?");
  }
  if (data.computation_time_ms !== undefined) {
    columns.push("computation_time_ms");
    values.push(data.computation_time_ms);
    placeholders.push("?");
  }
  if (data.detailed_metrics !== undefined) {
    columns.push("detailed_metrics");
    values.push(JSON.stringify(data.detailed_metrics));
    placeholders.push("?");
  }

  const sql = `INSERT INTO conformance_results (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ConformanceResultsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.conformance_job_id !== undefined) {
    sets.push("conformance_job_id = ?");
    values.push(data.conformance_job_id);
  }
  if (data.computed_at !== undefined) {
    sets.push("computed_at = ?");
    values.push(data.computed_at);
  }
  if (data.cases_checked !== undefined) {
    sets.push("cases_checked = ?");
    values.push(data.cases_checked);
  }
  if (data.conforming_cases !== undefined) {
    sets.push("conforming_cases = ?");
    values.push(data.conforming_cases);
  }
  if (data.non_conforming_cases !== undefined) {
    sets.push("non_conforming_cases = ?");
    values.push(data.non_conforming_cases);
  }
  if (data.fitness !== undefined) {
    sets.push("fitness = ?");
    values.push(data.fitness);
  }
  if (data.precision !== undefined) {
    sets.push("precision = ?");
    values.push(data.precision);
  }
  if (data.generalization !== undefined) {
    sets.push("generalization = ?");
    values.push(data.generalization);
  }
  if (data.computation_time_ms !== undefined) {
    sets.push("computation_time_ms = ?");
    values.push(data.computation_time_ms);
  }
  if (data.detailed_metrics !== undefined) {
    sets.push("detailed_metrics = ?");
    values.push(JSON.stringify(data.detailed_metrics));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE conformance_results SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ConformanceResultsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ConformanceResults | null {
    return this.db.query<ConformanceResults, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ConformanceResults[] {
    return this.db.query<ConformanceResults, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ConformanceResultsInsert): ConformanceResults {
    const { sql, params } = buildInsert(data);
    return this.db.query<ConformanceResults, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ConformanceResultsUpdate, tenantId: string): ConformanceResults | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ConformanceResults, unknown[]>(sql).get(...params) ?? null;
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