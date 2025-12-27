/**
 * Repository for data_connections
 * Source: 01_core.sql
 */

import { Database } from "bun:sqlite";
import type { DataConnections, DataConnectionsInsert, DataConnectionsUpdate } from "../types/data-connections";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "data_connections";

const SELECT_BY_ID = "SELECT * FROM data_connections WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM data_connections WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM data_connections WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM data_connections`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: DataConnectionsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.data_pool_id !== undefined) {
    columns.push("data_pool_id");
    values.push(data.data_pool_id);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.connector_type !== undefined) {
    columns.push("connector_type");
    values.push(data.connector_type);
    placeholders.push("?");
  }
  if (data.connection_config !== undefined) {
    columns.push("connection_config");
    values.push(JSON.stringify(data.connection_config));
    placeholders.push("?");
  }
  if (data.extraction_config !== undefined) {
    columns.push("extraction_config");
    values.push(JSON.stringify(data.extraction_config));
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.last_tested_at !== undefined) {
    columns.push("last_tested_at");
    values.push(data.last_tested_at);
    placeholders.push("?");
  }
  if (data.last_sync_at !== undefined) {
    columns.push("last_sync_at");
    values.push(data.last_sync_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO data_connections (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: DataConnectionsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.data_pool_id !== undefined) {
    sets.push("data_pool_id = ?");
    values.push(data.data_pool_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.connector_type !== undefined) {
    sets.push("connector_type = ?");
    values.push(data.connector_type);
  }
  if (data.connection_config !== undefined) {
    sets.push("connection_config = ?");
    values.push(JSON.stringify(data.connection_config));
  }
  if (data.extraction_config !== undefined) {
    sets.push("extraction_config = ?");
    values.push(JSON.stringify(data.extraction_config));
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.last_tested_at !== undefined) {
    sets.push("last_tested_at = ?");
    values.push(data.last_tested_at);
  }
  if (data.last_sync_at !== undefined) {
    sets.push("last_sync_at = ?");
    values.push(data.last_sync_at);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE data_connections SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class DataConnectionsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): DataConnections | null {
    return this.db.query<DataConnections, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): DataConnections[] {
    return this.db.query<DataConnections, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: DataConnectionsInsert): DataConnections {
    const { sql, params } = buildInsert(data);
    return this.db.query<DataConnections, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: DataConnectionsUpdate, tenantId: string): DataConnections | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<DataConnections, unknown[]>(sql).get(...params) ?? null;
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