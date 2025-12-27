/**
 * Repository for api_keys
 * Source: 25_integration_layer.sql
 */

import { Database } from "bun:sqlite";
import type { ApiKeys, ApiKeysInsert, ApiKeysUpdate } from "../types/api-keys";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "api_keys";

const SELECT_BY_ID = "SELECT * FROM api_keys WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM api_keys WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM api_keys WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM api_keys`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ApiKeysInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.environment_id !== undefined) {
    columns.push("environment_id");
    values.push(data.environment_id);
    placeholders.push("?");
  }
  if (data.created_by !== undefined) {
    columns.push("created_by");
    values.push(data.created_by);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.key_prefix !== undefined) {
    columns.push("key_prefix");
    values.push(data.key_prefix);
    placeholders.push("?");
  }
  if (data.key_hash !== undefined) {
    columns.push("key_hash");
    values.push(data.key_hash);
    placeholders.push("?");
  }
  if (data.scopes !== undefined) {
    columns.push("scopes");
    values.push(JSON.stringify(data.scopes));
    placeholders.push("?");
  }
  if (data.rate_limit !== undefined) {
    columns.push("rate_limit");
    values.push(data.rate_limit);
    placeholders.push("?");
  }
  if (data.allowed_ips !== undefined) {
    columns.push("allowed_ips");
    values.push(data.allowed_ips);
    placeholders.push("?");
  }
  if (data.last_used_at !== undefined) {
    columns.push("last_used_at");
    values.push(data.last_used_at);
    placeholders.push("?");
  }
  if (data.expires_at !== undefined) {
    columns.push("expires_at");
    values.push(data.expires_at);
    placeholders.push("?");
  }
  if (data.revoked_at !== undefined) {
    columns.push("revoked_at");
    values.push(data.revoked_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO api_keys (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ApiKeysUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.environment_id !== undefined) {
    sets.push("environment_id = ?");
    values.push(data.environment_id);
  }
  if (data.created_by !== undefined) {
    sets.push("created_by = ?");
    values.push(data.created_by);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.key_prefix !== undefined) {
    sets.push("key_prefix = ?");
    values.push(data.key_prefix);
  }
  if (data.key_hash !== undefined) {
    sets.push("key_hash = ?");
    values.push(data.key_hash);
  }
  if (data.scopes !== undefined) {
    sets.push("scopes = ?");
    values.push(JSON.stringify(data.scopes));
  }
  if (data.rate_limit !== undefined) {
    sets.push("rate_limit = ?");
    values.push(data.rate_limit);
  }
  if (data.allowed_ips !== undefined) {
    sets.push("allowed_ips = ?");
    values.push(data.allowed_ips);
  }
  if (data.last_used_at !== undefined) {
    sets.push("last_used_at = ?");
    values.push(data.last_used_at);
  }
  if (data.expires_at !== undefined) {
    sets.push("expires_at = ?");
    values.push(data.expires_at);
  }
  if (data.revoked_at !== undefined) {
    sets.push("revoked_at = ?");
    values.push(data.revoked_at);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE api_keys SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ApiKeysRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ApiKeys | null {
    return this.db.query<ApiKeys, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ApiKeys[] {
    return this.db.query<ApiKeys, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ApiKeysInsert): ApiKeys {
    const { sql, params } = buildInsert(data);
    return this.db.query<ApiKeys, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ApiKeysUpdate, tenantId: string): ApiKeys | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ApiKeys, unknown[]>(sql).get(...params) ?? null;
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