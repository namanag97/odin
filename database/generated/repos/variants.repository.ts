/**
 * Repository for variants
 * Source: 02_case_centric.sql
 */

import { Database } from "bun:sqlite";
import type { Variants, VariantsInsert, VariantsUpdate } from "../types/variants";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "variants";

const SELECT_BY_ID = "SELECT * FROM variants WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM variants WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM variants WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM variants`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: VariantsInsert): { sql: string; params: unknown[] } {
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
  if (data.sequence !== undefined) {
    columns.push("sequence");
    values.push(data.sequence);
    placeholders.push("?");
  }
  if (data.sequence_hash !== undefined) {
    columns.push("sequence_hash");
    values.push(data.sequence_hash);
    placeholders.push("?");
  }
  if (data.case_count !== undefined) {
    columns.push("case_count");
    values.push(data.case_count);
    placeholders.push("?");
  }
  if (data.percentage !== undefined) {
    columns.push("percentage");
    values.push(data.percentage);
    placeholders.push("?");
  }
  if (data.avg_duration_seconds !== undefined) {
    columns.push("avg_duration_seconds");
    values.push(data.avg_duration_seconds);
    placeholders.push("?");
  }
  if (data.min_duration_seconds !== undefined) {
    columns.push("min_duration_seconds");
    values.push(data.min_duration_seconds);
    placeholders.push("?");
  }
  if (data.max_duration_seconds !== undefined) {
    columns.push("max_duration_seconds");
    values.push(data.max_duration_seconds);
    placeholders.push("?");
  }
  if (data.is_happy_path !== undefined) {
    columns.push("is_happy_path");
    values.push(data.is_happy_path);
    placeholders.push("?");
  }
  if (data.first_seen_at !== undefined) {
    columns.push("first_seen_at");
    values.push(data.first_seen_at);
    placeholders.push("?");
  }
  if (data.last_seen_at !== undefined) {
    columns.push("last_seen_at");
    values.push(data.last_seen_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO variants (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: VariantsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.event_log_id !== undefined) {
    sets.push("event_log_id = ?");
    values.push(data.event_log_id);
  }
  if (data.sequence !== undefined) {
    sets.push("sequence = ?");
    values.push(data.sequence);
  }
  if (data.sequence_hash !== undefined) {
    sets.push("sequence_hash = ?");
    values.push(data.sequence_hash);
  }
  if (data.case_count !== undefined) {
    sets.push("case_count = ?");
    values.push(data.case_count);
  }
  if (data.percentage !== undefined) {
    sets.push("percentage = ?");
    values.push(data.percentage);
  }
  if (data.avg_duration_seconds !== undefined) {
    sets.push("avg_duration_seconds = ?");
    values.push(data.avg_duration_seconds);
  }
  if (data.min_duration_seconds !== undefined) {
    sets.push("min_duration_seconds = ?");
    values.push(data.min_duration_seconds);
  }
  if (data.max_duration_seconds !== undefined) {
    sets.push("max_duration_seconds = ?");
    values.push(data.max_duration_seconds);
  }
  if (data.is_happy_path !== undefined) {
    sets.push("is_happy_path = ?");
    values.push(data.is_happy_path);
  }
  if (data.first_seen_at !== undefined) {
    sets.push("first_seen_at = ?");
    values.push(data.first_seen_at);
  }
  if (data.last_seen_at !== undefined) {
    sets.push("last_seen_at = ?");
    values.push(data.last_seen_at);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE variants SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class VariantsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Variants | null {
    return this.db.query<Variants, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Variants[] {
    return this.db.query<Variants, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: VariantsInsert): Variants {
    const { sql, params } = buildInsert(data);
    return this.db.query<Variants, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: VariantsUpdate, tenantId: string): Variants | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Variants, unknown[]>(sql).get(...params) ?? null;
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