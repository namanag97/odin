/**
 * Repository for coupons
 * Source: 22_commercial_layer.sql
 */

import { Database } from "bun:sqlite";
import type { Coupons, CouponsInsert, CouponsUpdate } from "../types/coupons";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "coupons";

const SELECT_BY_ID = "SELECT * FROM coupons WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM coupons WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM coupons";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM coupons`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: CouponsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.code !== undefined) {
    columns.push("code");
    values.push(data.code);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.discount_type !== undefined) {
    columns.push("discount_type");
    values.push(data.discount_type);
    placeholders.push("?");
  }
  if (data.discount_value !== undefined) {
    columns.push("discount_value");
    values.push(data.discount_value);
    placeholders.push("?");
  }
  if (data.currency !== undefined) {
    columns.push("currency");
    values.push(data.currency);
    placeholders.push("?");
  }
  if (data.duration !== undefined) {
    columns.push("duration");
    values.push(data.duration);
    placeholders.push("?");
  }
  if (data.duration_months !== undefined) {
    columns.push("duration_months");
    values.push(data.duration_months);
    placeholders.push("?");
  }
  if (data.max_redemptions !== undefined) {
    columns.push("max_redemptions");
    values.push(data.max_redemptions);
    placeholders.push("?");
  }
  if (data.times_redeemed !== undefined) {
    columns.push("times_redeemed");
    values.push(data.times_redeemed);
    placeholders.push("?");
  }
  if (data.valid_from !== undefined) {
    columns.push("valid_from");
    values.push(data.valid_from);
    placeholders.push("?");
  }
  if (data.valid_until !== undefined) {
    columns.push("valid_until");
    values.push(data.valid_until);
    placeholders.push("?");
  }
  if (data.is_active !== undefined) {
    columns.push("is_active");
    values.push(data.is_active);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO coupons (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: CouponsUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.code !== undefined) {
    sets.push("code = ?");
    values.push(data.code);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.discount_type !== undefined) {
    sets.push("discount_type = ?");
    values.push(data.discount_type);
  }
  if (data.discount_value !== undefined) {
    sets.push("discount_value = ?");
    values.push(data.discount_value);
  }
  if (data.currency !== undefined) {
    sets.push("currency = ?");
    values.push(data.currency);
  }
  if (data.duration !== undefined) {
    sets.push("duration = ?");
    values.push(data.duration);
  }
  if (data.duration_months !== undefined) {
    sets.push("duration_months = ?");
    values.push(data.duration_months);
  }
  if (data.max_redemptions !== undefined) {
    sets.push("max_redemptions = ?");
    values.push(data.max_redemptions);
  }
  if (data.times_redeemed !== undefined) {
    sets.push("times_redeemed = ?");
    values.push(data.times_redeemed);
  }
  if (data.valid_from !== undefined) {
    sets.push("valid_from = ?");
    values.push(data.valid_from);
  }
  if (data.valid_until !== undefined) {
    sets.push("valid_until = ?");
    values.push(data.valid_until);
  }
  if (data.is_active !== undefined) {
    sets.push("is_active = ?");
    values.push(data.is_active);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  const sql = `UPDATE coupons SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class CouponsRepository {
  constructor(private db: Database) {}

  findById(id: string): Coupons | null {
    return this.db.query<Coupons, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): Coupons[] {
    return this.db.query<Coupons, []>(buildSelectAll(options)).all();
  }

  create(data: CouponsInsert): Coupons {
    const { sql, params } = buildInsert(data);
    return this.db.query<Coupons, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: CouponsUpdate): Coupons | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<Coupons, unknown[]>(sql).get(...params) ?? null;
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