/**
 * Repository for tenants
 * Source: 01_core.sql
 */

import { Database } from "bun:sqlite";
import type { Tenants, TenantsInsert, TenantsUpdate } from "../types/tenants";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "tenants";

const SELECT_BY_ID = "SELECT * FROM tenants WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM tenants WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM tenants";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM tenants`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: TenantsInsert): { sql: string; params: unknown[] } {
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
  if (data.type !== undefined) {
    columns.push("type");
    values.push(data.type);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.tier !== undefined) {
    columns.push("tier");
    values.push(data.tier);
    placeholders.push("?");
  }
  if (data.settings !== undefined) {
    columns.push("settings");
    values.push(JSON.stringify(data.settings));
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }
  if (data.storage_quota_gb !== undefined) {
    columns.push("storage_quota_gb");
    values.push(data.storage_quota_gb);
    placeholders.push("?");
  }
  if (data.event_quota_monthly !== undefined) {
    columns.push("event_quota_monthly");
    values.push(data.event_quota_monthly);
    placeholders.push("?");
  }
  if (data.deleted_at !== undefined) {
    columns.push("deleted_at");
    values.push(data.deleted_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO tenants (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: TenantsUpdate): { sql: string; params: unknown[] } {
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
  if (data.type !== undefined) {
    sets.push("type = ?");
    values.push(data.type);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.tier !== undefined) {
    sets.push("tier = ?");
    values.push(data.tier);
  }
  if (data.settings !== undefined) {
    sets.push("settings = ?");
    values.push(JSON.stringify(data.settings));
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }
  if (data.storage_quota_gb !== undefined) {
    sets.push("storage_quota_gb = ?");
    values.push(data.storage_quota_gb);
  }
  if (data.event_quota_monthly !== undefined) {
    sets.push("event_quota_monthly = ?");
    values.push(data.event_quota_monthly);
  }
  if (data.deleted_at !== undefined) {
    sets.push("deleted_at = ?");
    values.push(data.deleted_at);
  }

  values.push(id);
  const sql = `UPDATE tenants SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class TenantsRepository {
  constructor(private db: Database) {}

  findById(id: string): Tenants | null {
    return this.db.query<Tenants, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): Tenants[] {
    return this.db.query<Tenants, []>(buildSelectAll(options)).all();
  }

  create(data: TenantsInsert): Tenants {
    const { sql, params } = buildInsert(data);
    return this.db.query<Tenants, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: TenantsUpdate): Tenants | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<Tenants, unknown[]>(sql).get(...params) ?? null;
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