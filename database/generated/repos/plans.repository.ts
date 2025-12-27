/**
 * Repository for plans
 * Source: 22_commercial_layer.sql
 */

import { Database } from "bun:sqlite";
import type { Plans, PlansInsert, PlansUpdate } from "../types/plans";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "plans";

const SELECT_BY_ID = "SELECT * FROM plans WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM plans WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM plans";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM plans`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: PlansInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.external_id !== undefined) {
    columns.push("external_id");
    values.push(data.external_id);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.slug !== undefined) {
    columns.push("slug");
    values.push(data.slug);
    placeholders.push("?");
  }
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.tier !== undefined) {
    columns.push("tier");
    values.push(data.tier);
    placeholders.push("?");
  }
  if (data.billing_interval !== undefined) {
    columns.push("billing_interval");
    values.push(data.billing_interval);
    placeholders.push("?");
  }
  if (data.base_price !== undefined) {
    columns.push("base_price");
    values.push(data.base_price);
    placeholders.push("?");
  }
  if (data.currency !== undefined) {
    columns.push("currency");
    values.push(data.currency);
    placeholders.push("?");
  }
  if (data.is_public !== undefined) {
    columns.push("is_public");
    values.push(data.is_public);
    placeholders.push("?");
  }
  if (data.is_active !== undefined) {
    columns.push("is_active");
    values.push(data.is_active);
    placeholders.push("?");
  }
  if (data.trial_days !== undefined) {
    columns.push("trial_days");
    values.push(data.trial_days);
    placeholders.push("?");
  }
  if (data.features !== undefined) {
    columns.push("features");
    values.push(JSON.stringify(data.features));
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO plans (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: PlansUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.external_id !== undefined) {
    sets.push("external_id = ?");
    values.push(data.external_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.slug !== undefined) {
    sets.push("slug = ?");
    values.push(data.slug);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.tier !== undefined) {
    sets.push("tier = ?");
    values.push(data.tier);
  }
  if (data.billing_interval !== undefined) {
    sets.push("billing_interval = ?");
    values.push(data.billing_interval);
  }
  if (data.base_price !== undefined) {
    sets.push("base_price = ?");
    values.push(data.base_price);
  }
  if (data.currency !== undefined) {
    sets.push("currency = ?");
    values.push(data.currency);
  }
  if (data.is_public !== undefined) {
    sets.push("is_public = ?");
    values.push(data.is_public);
  }
  if (data.is_active !== undefined) {
    sets.push("is_active = ?");
    values.push(data.is_active);
  }
  if (data.trial_days !== undefined) {
    sets.push("trial_days = ?");
    values.push(data.trial_days);
  }
  if (data.features !== undefined) {
    sets.push("features = ?");
    values.push(JSON.stringify(data.features));
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  const sql = `UPDATE plans SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class PlansRepository {
  constructor(private db: Database) {}

  findById(id: string): Plans | null {
    return this.db.query<Plans, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): Plans[] {
    return this.db.query<Plans, []>(buildSelectAll(options)).all();
  }

  create(data: PlansInsert): Plans {
    const { sql, params } = buildInsert(data);
    return this.db.query<Plans, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: PlansUpdate): Plans | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<Plans, unknown[]>(sql).get(...params) ?? null;
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