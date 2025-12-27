/**
 * Repository for cases
 * Source: 02_case_centric.sql
 */

import { Database } from "bun:sqlite";
import type { Cases, CasesInsert, CasesUpdate } from "../types/cases";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "cases";

const SELECT_BY_ID = "SELECT * FROM cases WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM cases WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM cases WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM cases`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: CasesInsert): { sql: string; params: unknown[] } {
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
  if (data.case_id !== undefined) {
    columns.push("case_id");
    values.push(data.case_id);
    placeholders.push("?");
  }
  if (data.variant_id !== undefined) {
    columns.push("variant_id");
    values.push(data.variant_id);
    placeholders.push("?");
  }
  if (data.start_time !== undefined) {
    columns.push("start_time");
    values.push(data.start_time);
    placeholders.push("?");
  }
  if (data.end_time !== undefined) {
    columns.push("end_time");
    values.push(data.end_time);
    placeholders.push("?");
  }
  if (data.duration_seconds !== undefined) {
    columns.push("duration_seconds");
    values.push(data.duration_seconds);
    placeholders.push("?");
  }
  if (data.event_count !== undefined) {
    columns.push("event_count");
    values.push(data.event_count);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.attributes !== undefined) {
    columns.push("attributes");
    values.push(JSON.stringify(data.attributes));
    placeholders.push("?");
  }

  const sql = `INSERT INTO cases (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: CasesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.event_log_id !== undefined) {
    sets.push("event_log_id = ?");
    values.push(data.event_log_id);
  }
  if (data.case_id !== undefined) {
    sets.push("case_id = ?");
    values.push(data.case_id);
  }
  if (data.variant_id !== undefined) {
    sets.push("variant_id = ?");
    values.push(data.variant_id);
  }
  if (data.start_time !== undefined) {
    sets.push("start_time = ?");
    values.push(data.start_time);
  }
  if (data.end_time !== undefined) {
    sets.push("end_time = ?");
    values.push(data.end_time);
  }
  if (data.duration_seconds !== undefined) {
    sets.push("duration_seconds = ?");
    values.push(data.duration_seconds);
  }
  if (data.event_count !== undefined) {
    sets.push("event_count = ?");
    values.push(data.event_count);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.attributes !== undefined) {
    sets.push("attributes = ?");
    values.push(JSON.stringify(data.attributes));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE cases SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class CasesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Cases | null {
    return this.db.query<Cases, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Cases[] {
    return this.db.query<Cases, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: CasesInsert): Cases {
    const { sql, params } = buildInsert(data);
    return this.db.query<Cases, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: CasesUpdate, tenantId: string): Cases | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Cases, unknown[]>(sql).get(...params) ?? null;
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