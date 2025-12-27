/**
 * Repository for feature_flag_overrides
 * Source: 23_operational_layer.sql
 */

import { Database } from "bun:sqlite";
import type { FeatureFlagOverrides, FeatureFlagOverridesInsert, FeatureFlagOverridesUpdate } from "../types/feature-flag-overrides";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "feature_flag_overrides";

const SELECT_BY_ID = "SELECT * FROM feature_flag_overrides WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM feature_flag_overrides WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM feature_flag_overrides";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM feature_flag_overrides`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: FeatureFlagOverridesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.feature_flag_id !== undefined) {
    columns.push("feature_flag_id");
    values.push(data.feature_flag_id);
    placeholders.push("?");
  }
  if (data.target_type !== undefined) {
    columns.push("target_type");
    values.push(data.target_type);
    placeholders.push("?");
  }
  if (data.target_id !== undefined) {
    columns.push("target_id");
    values.push(data.target_id);
    placeholders.push("?");
  }
  if (data.value !== undefined) {
    columns.push("value");
    values.push(data.value);
    placeholders.push("?");
  }
  if (data.expires_at !== undefined) {
    columns.push("expires_at");
    values.push(data.expires_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO feature_flag_overrides (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: FeatureFlagOverridesUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.feature_flag_id !== undefined) {
    sets.push("feature_flag_id = ?");
    values.push(data.feature_flag_id);
  }
  if (data.target_type !== undefined) {
    sets.push("target_type = ?");
    values.push(data.target_type);
  }
  if (data.target_id !== undefined) {
    sets.push("target_id = ?");
    values.push(data.target_id);
  }
  if (data.value !== undefined) {
    sets.push("value = ?");
    values.push(data.value);
  }
  if (data.expires_at !== undefined) {
    sets.push("expires_at = ?");
    values.push(data.expires_at);
  }

  values.push(id);
  const sql = `UPDATE feature_flag_overrides SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class FeatureFlagOverridesRepository {
  constructor(private db: Database) {}

  findById(id: string): FeatureFlagOverrides | null {
    return this.db.query<FeatureFlagOverrides, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): FeatureFlagOverrides[] {
    return this.db.query<FeatureFlagOverrides, []>(buildSelectAll(options)).all();
  }

  create(data: FeatureFlagOverridesInsert): FeatureFlagOverrides {
    const { sql, params } = buildInsert(data);
    return this.db.query<FeatureFlagOverrides, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: FeatureFlagOverridesUpdate): FeatureFlagOverrides | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<FeatureFlagOverrides, unknown[]>(sql).get(...params) ?? null;
  }

  delete(id: string): boolean {
    this.db.query(DELETE_BY_ID).run(id);
    return true;
  }

  count(): number {
    const result = this.db.query<{ count: number }, []>(COUNT_SQL).get();
    return result?.count ?? 0;
  }
}