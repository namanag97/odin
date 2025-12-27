/**
 * Repository for plan_features
 * Source: 22_commercial_layer.sql
 */

import { Database } from "bun:sqlite";
import type { PlanFeatures, PlanFeaturesInsert, PlanFeaturesUpdate } from "../types/plan-features";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "plan_features";

const SELECT_BY_ID = "SELECT * FROM plan_features WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM plan_features WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM plan_features";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM plan_features`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: PlanFeaturesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.plan_id !== undefined) {
    columns.push("plan_id");
    values.push(data.plan_id);
    placeholders.push("?");
  }
  if (data.feature_key !== undefined) {
    columns.push("feature_key");
    values.push(data.feature_key);
    placeholders.push("?");
  }
  if (data.is_enabled !== undefined) {
    columns.push("is_enabled");
    values.push(data.is_enabled);
    placeholders.push("?");
  }
  if (data.config !== undefined) {
    columns.push("config");
    values.push(JSON.stringify(data.config));
    placeholders.push("?");
  }

  const sql = `INSERT INTO plan_features (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: PlanFeaturesUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.plan_id !== undefined) {
    sets.push("plan_id = ?");
    values.push(data.plan_id);
  }
  if (data.feature_key !== undefined) {
    sets.push("feature_key = ?");
    values.push(data.feature_key);
  }
  if (data.is_enabled !== undefined) {
    sets.push("is_enabled = ?");
    values.push(data.is_enabled);
  }
  if (data.config !== undefined) {
    sets.push("config = ?");
    values.push(JSON.stringify(data.config));
  }

  values.push(id);
  const sql = `UPDATE plan_features SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class PlanFeaturesRepository {
  constructor(private db: Database) {}

  findById(id: string): PlanFeatures | null {
    return this.db.query<PlanFeatures, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): PlanFeatures[] {
    return this.db.query<PlanFeatures, []>(buildSelectAll(options)).all();
  }

  create(data: PlanFeaturesInsert): PlanFeatures {
    const { sql, params } = buildInsert(data);
    return this.db.query<PlanFeatures, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: PlanFeaturesUpdate): PlanFeatures | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<PlanFeatures, unknown[]>(sql).get(...params) ?? null;
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