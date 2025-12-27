/**
 * Repository for feature_flags
 * Source: 23_operational_layer.sql
 */

import { Database } from "bun:sqlite";
import type { FeatureFlags, FeatureFlagsInsert, FeatureFlagsUpdate } from "../types/feature-flags";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "feature_flags";

const SELECT_BY_ID = "SELECT * FROM feature_flags WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM feature_flags WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM feature_flags";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM feature_flags`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: FeatureFlagsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.key !== undefined) {
    columns.push("key");
    values.push(data.key);
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
  if (data.type !== undefined) {
    columns.push("type");
    values.push(data.type);
    placeholders.push("?");
  }
  if (data.default_value !== undefined) {
    columns.push("default_value");
    values.push(data.default_value);
    placeholders.push("?");
  }
  if (data.is_enabled !== undefined) {
    columns.push("is_enabled");
    values.push(data.is_enabled);
    placeholders.push("?");
  }
  if (data.targeting_rules !== undefined) {
    columns.push("targeting_rules");
    values.push(JSON.stringify(data.targeting_rules));
    placeholders.push("?");
  }

  const sql = `INSERT INTO feature_flags (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: FeatureFlagsUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.key !== undefined) {
    sets.push("key = ?");
    values.push(data.key);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.type !== undefined) {
    sets.push("type = ?");
    values.push(data.type);
  }
  if (data.default_value !== undefined) {
    sets.push("default_value = ?");
    values.push(data.default_value);
  }
  if (data.is_enabled !== undefined) {
    sets.push("is_enabled = ?");
    values.push(data.is_enabled);
  }
  if (data.targeting_rules !== undefined) {
    sets.push("targeting_rules = ?");
    values.push(JSON.stringify(data.targeting_rules));
  }

  values.push(id);
  const sql = `UPDATE feature_flags SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class FeatureFlagsRepository {
  constructor(private db: Database) {}

  findById(id: string): FeatureFlags | null {
    return this.db.query<FeatureFlags, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): FeatureFlags[] {
    return this.db.query<FeatureFlags, []>(buildSelectAll(options)).all();
  }

  create(data: FeatureFlagsInsert): FeatureFlags {
    const { sql, params } = buildInsert(data);
    return this.db.query<FeatureFlags, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: FeatureFlagsUpdate): FeatureFlags | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<FeatureFlags, unknown[]>(sql).get(...params) ?? null;
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