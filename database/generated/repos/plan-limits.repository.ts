/**
 * Repository for plan_limits
 * Source: 22_commercial_layer.sql
 */

import { Database } from "bun:sqlite";
import type { PlanLimits, PlanLimitsInsert, PlanLimitsUpdate } from "../types/plan-limits";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "plan_limits";

const SELECT_BY_ID = "SELECT * FROM plan_limits WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM plan_limits WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM plan_limits";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM plan_limits`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: PlanLimitsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.plan_id !== undefined) {
    columns.push("plan_id");
    values.push(data.plan_id);
    placeholders.push("?");
  }
  if (data.resource_type !== undefined) {
    columns.push("resource_type");
    values.push(data.resource_type);
    placeholders.push("?");
  }
  if (data.limit_value !== undefined) {
    columns.push("limit_value");
    values.push(data.limit_value);
    placeholders.push("?");
  }
  if (data.limit_type !== undefined) {
    columns.push("limit_type");
    values.push(data.limit_type);
    placeholders.push("?");
  }
  if (data.reset_interval !== undefined) {
    columns.push("reset_interval");
    values.push(data.reset_interval);
    placeholders.push("?");
  }
  if (data.overage_allowed !== undefined) {
    columns.push("overage_allowed");
    values.push(data.overage_allowed);
    placeholders.push("?");
  }
  if (data.overage_price !== undefined) {
    columns.push("overage_price");
    values.push(data.overage_price);
    placeholders.push("?");
  }

  const sql = `INSERT INTO plan_limits (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: PlanLimitsUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.plan_id !== undefined) {
    sets.push("plan_id = ?");
    values.push(data.plan_id);
  }
  if (data.resource_type !== undefined) {
    sets.push("resource_type = ?");
    values.push(data.resource_type);
  }
  if (data.limit_value !== undefined) {
    sets.push("limit_value = ?");
    values.push(data.limit_value);
  }
  if (data.limit_type !== undefined) {
    sets.push("limit_type = ?");
    values.push(data.limit_type);
  }
  if (data.reset_interval !== undefined) {
    sets.push("reset_interval = ?");
    values.push(data.reset_interval);
  }
  if (data.overage_allowed !== undefined) {
    sets.push("overage_allowed = ?");
    values.push(data.overage_allowed);
  }
  if (data.overage_price !== undefined) {
    sets.push("overage_price = ?");
    values.push(data.overage_price);
  }

  values.push(id);
  const sql = `UPDATE plan_limits SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class PlanLimitsRepository {
  constructor(private db: Database) {}

  findById(id: string): PlanLimits | null {
    return this.db.query<PlanLimits, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): PlanLimits[] {
    return this.db.query<PlanLimits, []>(buildSelectAll(options)).all();
  }

  create(data: PlanLimitsInsert): PlanLimits {
    const { sql, params } = buildInsert(data);
    return this.db.query<PlanLimits, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: PlanLimitsUpdate): PlanLimits | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<PlanLimits, unknown[]>(sql).get(...params) ?? null;
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