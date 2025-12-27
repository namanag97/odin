/**
 * Repository for deviations
 * Source: 06_conformance.sql
 */

import { Database } from "bun:sqlite";
import type { Deviations, DeviationsInsert, DeviationsUpdate } from "../types/deviations";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "deviations";

const SELECT_BY_ID = "SELECT * FROM deviations WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM deviations WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM deviations WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM deviations`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: DeviationsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.conformance_result_id !== undefined) {
    columns.push("conformance_result_id");
    values.push(data.conformance_result_id);
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
  if (data.event_id !== undefined) {
    columns.push("event_id");
    values.push(data.event_id);
    placeholders.push("?");
  }
  if (data.deviation_type !== undefined) {
    columns.push("deviation_type");
    values.push(data.deviation_type);
    placeholders.push("?");
  }
  if (data.expected_activity !== undefined) {
    columns.push("expected_activity");
    values.push(data.expected_activity);
    placeholders.push("?");
  }
  if (data.actual_activity !== undefined) {
    columns.push("actual_activity");
    values.push(data.actual_activity);
    placeholders.push("?");
  }
  if (data.position_in_trace !== undefined) {
    columns.push("position_in_trace");
    values.push(data.position_in_trace);
    placeholders.push("?");
  }
  if (data.severity !== undefined) {
    columns.push("severity");
    values.push(data.severity);
    placeholders.push("?");
  }
  if (data.cost !== undefined) {
    columns.push("cost");
    values.push(data.cost);
    placeholders.push("?");
  }
  if (data.details !== undefined) {
    columns.push("details");
    values.push(JSON.stringify(data.details));
    placeholders.push("?");
  }
  if (data.detected_at !== undefined) {
    columns.push("detected_at");
    values.push(data.detected_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO deviations (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: DeviationsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.conformance_result_id !== undefined) {
    sets.push("conformance_result_id = ?");
    values.push(data.conformance_result_id);
  }
  if (data.case_id !== undefined) {
    sets.push("case_id = ?");
    values.push(data.case_id);
  }
  if (data.event_id !== undefined) {
    sets.push("event_id = ?");
    values.push(data.event_id);
  }
  if (data.deviation_type !== undefined) {
    sets.push("deviation_type = ?");
    values.push(data.deviation_type);
  }
  if (data.expected_activity !== undefined) {
    sets.push("expected_activity = ?");
    values.push(data.expected_activity);
  }
  if (data.actual_activity !== undefined) {
    sets.push("actual_activity = ?");
    values.push(data.actual_activity);
  }
  if (data.position_in_trace !== undefined) {
    sets.push("position_in_trace = ?");
    values.push(data.position_in_trace);
  }
  if (data.severity !== undefined) {
    sets.push("severity = ?");
    values.push(data.severity);
  }
  if (data.cost !== undefined) {
    sets.push("cost = ?");
    values.push(data.cost);
  }
  if (data.details !== undefined) {
    sets.push("details = ?");
    values.push(JSON.stringify(data.details));
  }
  if (data.detected_at !== undefined) {
    sets.push("detected_at = ?");
    values.push(data.detected_at);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE deviations SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class DeviationsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Deviations | null {
    return this.db.query<Deviations, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Deviations[] {
    return this.db.query<Deviations, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: DeviationsInsert): Deviations {
    const { sql, params } = buildInsert(data);
    return this.db.query<Deviations, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: DeviationsUpdate, tenantId: string): Deviations | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Deviations, unknown[]>(sql).get(...params) ?? null;
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