/**
 * Repository for identity_providers
 * Source: 21_identity_layer.sql
 */

import { Database } from "bun:sqlite";
import type { IdentityProviders, IdentityProvidersInsert, IdentityProvidersUpdate } from "../types/identity-providers";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "identity_providers";

const SELECT_BY_ID = "SELECT * FROM identity_providers WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM identity_providers WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM identity_providers WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM identity_providers`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: IdentityProvidersInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.type !== undefined) {
    columns.push("type");
    values.push(data.type);
    placeholders.push("?");
  }
  if (data.is_enabled !== undefined) {
    columns.push("is_enabled");
    values.push(data.is_enabled);
    placeholders.push("?");
  }
  if (data.is_default !== undefined) {
    columns.push("is_default");
    values.push(data.is_default);
    placeholders.push("?");
  }
  if (data.config_encrypted !== undefined) {
    columns.push("config_encrypted");
    values.push(JSON.stringify(data.config_encrypted));
    placeholders.push("?");
  }
  if (data.metadata_url !== undefined) {
    columns.push("metadata_url");
    values.push(JSON.stringify(data.metadata_url));
    placeholders.push("?");
  }
  if (data.domain_hints !== undefined) {
    columns.push("domain_hints");
    values.push(data.domain_hints);
    placeholders.push("?");
  }
  if (data.auto_provision !== undefined) {
    columns.push("auto_provision");
    values.push(data.auto_provision);
    placeholders.push("?");
  }
  if (data.default_role_id !== undefined) {
    columns.push("default_role_id");
    values.push(data.default_role_id);
    placeholders.push("?");
  }

  const sql = `INSERT INTO identity_providers (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: IdentityProvidersUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.type !== undefined) {
    sets.push("type = ?");
    values.push(data.type);
  }
  if (data.is_enabled !== undefined) {
    sets.push("is_enabled = ?");
    values.push(data.is_enabled);
  }
  if (data.is_default !== undefined) {
    sets.push("is_default = ?");
    values.push(data.is_default);
  }
  if (data.config_encrypted !== undefined) {
    sets.push("config_encrypted = ?");
    values.push(JSON.stringify(data.config_encrypted));
  }
  if (data.metadata_url !== undefined) {
    sets.push("metadata_url = ?");
    values.push(JSON.stringify(data.metadata_url));
  }
  if (data.domain_hints !== undefined) {
    sets.push("domain_hints = ?");
    values.push(data.domain_hints);
  }
  if (data.auto_provision !== undefined) {
    sets.push("auto_provision = ?");
    values.push(data.auto_provision);
  }
  if (data.default_role_id !== undefined) {
    sets.push("default_role_id = ?");
    values.push(data.default_role_id);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE identity_providers SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class IdentityProvidersRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): IdentityProviders | null {
    return this.db.query<IdentityProviders, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): IdentityProviders[] {
    return this.db.query<IdentityProviders, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: IdentityProvidersInsert): IdentityProviders {
    const { sql, params } = buildInsert(data);
    return this.db.query<IdentityProviders, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: IdentityProvidersUpdate, tenantId: string): IdentityProviders | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<IdentityProviders, unknown[]>(sql).get(...params) ?? null;
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