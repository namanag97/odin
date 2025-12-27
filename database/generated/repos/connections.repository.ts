/**
 * Repository for connections
 * Source: 18_automation_enhanced.sql
 */

import { Database } from "bun:sqlite";
import type { Connections, ConnectionsInsert, ConnectionsUpdate } from "../types/connections";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "connections";

const SELECT_BY_ID = "SELECT * FROM connections WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM connections WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM connections WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM connections`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ConnectionsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.package_id !== undefined) {
    columns.push("package_id");
    values.push(data.package_id);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.app_name !== undefined) {
    columns.push("app_name");
    values.push(data.app_name);
    placeholders.push("?");
  }
  if (data.connection_type !== undefined) {
    columns.push("connection_type");
    values.push(data.connection_type);
    placeholders.push("?");
  }
  if (data.credentials !== undefined) {
    columns.push("credentials");
    values.push(data.credentials);
    placeholders.push("?");
  }
  if (data.oauth_credentials_id !== undefined) {
    columns.push("oauth_credentials_id");
    values.push(data.oauth_credentials_id);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.is_dynamic !== undefined) {
    columns.push("is_dynamic");
    values.push(data.is_dynamic);
    placeholders.push("?");
  }
  if (data.last_used_at !== undefined) {
    columns.push("last_used_at");
    values.push(data.last_used_at);
    placeholders.push("?");
  }
  if (data.last_tested_at !== undefined) {
    columns.push("last_tested_at");
    values.push(data.last_tested_at);
    placeholders.push("?");
  }
  if (data.expires_at !== undefined) {
    columns.push("expires_at");
    values.push(data.expires_at);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }
  if (data.created_by !== undefined) {
    columns.push("created_by");
    values.push(data.created_by);
    placeholders.push("?");
  }

  const sql = `INSERT INTO connections (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ConnectionsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.package_id !== undefined) {
    sets.push("package_id = ?");
    values.push(data.package_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.app_name !== undefined) {
    sets.push("app_name = ?");
    values.push(data.app_name);
  }
  if (data.connection_type !== undefined) {
    sets.push("connection_type = ?");
    values.push(data.connection_type);
  }
  if (data.credentials !== undefined) {
    sets.push("credentials = ?");
    values.push(data.credentials);
  }
  if (data.oauth_credentials_id !== undefined) {
    sets.push("oauth_credentials_id = ?");
    values.push(data.oauth_credentials_id);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.is_dynamic !== undefined) {
    sets.push("is_dynamic = ?");
    values.push(data.is_dynamic);
  }
  if (data.last_used_at !== undefined) {
    sets.push("last_used_at = ?");
    values.push(data.last_used_at);
  }
  if (data.last_tested_at !== undefined) {
    sets.push("last_tested_at = ?");
    values.push(data.last_tested_at);
  }
  if (data.expires_at !== undefined) {
    sets.push("expires_at = ?");
    values.push(data.expires_at);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }
  if (data.created_by !== undefined) {
    sets.push("created_by = ?");
    values.push(data.created_by);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE connections SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ConnectionsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Connections | null {
    return this.db.query<Connections, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Connections[] {
    return this.db.query<Connections, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ConnectionsInsert): Connections {
    const { sql, params } = buildInsert(data);
    return this.db.query<Connections, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ConnectionsUpdate, tenantId: string): Connections | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Connections, unknown[]>(sql).get(...params) ?? null;
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