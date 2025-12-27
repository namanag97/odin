/**
 * Repository for integrations
 * Source: 25_integration_layer.sql
 */

import { Database } from "bun:sqlite";
import type { Integrations, IntegrationsInsert, IntegrationsUpdate } from "../types/integrations";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "integrations";

const SELECT_BY_ID = "SELECT * FROM integrations WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM integrations WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM integrations WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM integrations`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: IntegrationsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.provider !== undefined) {
    columns.push("provider");
    values.push(data.provider);
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
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.config_encrypted !== undefined) {
    columns.push("config_encrypted");
    values.push(JSON.stringify(data.config_encrypted));
    placeholders.push("?");
  }
  if (data.credentials_encrypted !== undefined) {
    columns.push("credentials_encrypted");
    values.push(data.credentials_encrypted);
    placeholders.push("?");
  }
  if (data.scopes !== undefined) {
    columns.push("scopes");
    values.push(data.scopes);
    placeholders.push("?");
  }
  if (data.last_sync_at !== undefined) {
    columns.push("last_sync_at");
    values.push(data.last_sync_at);
    placeholders.push("?");
  }
  if (data.sync_status !== undefined) {
    columns.push("sync_status");
    values.push(data.sync_status);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO integrations (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: IntegrationsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.provider !== undefined) {
    sets.push("provider = ?");
    values.push(data.provider);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.type !== undefined) {
    sets.push("type = ?");
    values.push(data.type);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.config_encrypted !== undefined) {
    sets.push("config_encrypted = ?");
    values.push(JSON.stringify(data.config_encrypted));
  }
  if (data.credentials_encrypted !== undefined) {
    sets.push("credentials_encrypted = ?");
    values.push(data.credentials_encrypted);
  }
  if (data.scopes !== undefined) {
    sets.push("scopes = ?");
    values.push(data.scopes);
  }
  if (data.last_sync_at !== undefined) {
    sets.push("last_sync_at = ?");
    values.push(data.last_sync_at);
  }
  if (data.sync_status !== undefined) {
    sets.push("sync_status = ?");
    values.push(data.sync_status);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE integrations SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class IntegrationsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Integrations | null {
    return this.db.query<Integrations, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Integrations[] {
    return this.db.query<Integrations, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: IntegrationsInsert): Integrations {
    const { sql, params } = buildInsert(data);
    return this.db.query<Integrations, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: IntegrationsUpdate, tenantId: string): Integrations | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Integrations, unknown[]>(sql).get(...params) ?? null;
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