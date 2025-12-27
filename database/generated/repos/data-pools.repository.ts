/**
 * Repository for data_pools
 * Source: 01_core.sql
 */

import { Database } from "bun:sqlite";
import type { DataPools, DataPoolsInsert, DataPoolsUpdate } from "../types/data-pools";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "data_pools";

const SELECT_BY_ID = "SELECT * FROM data_pools WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM data_pools WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM data_pools WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM data_pools`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: DataPoolsInsert): { sql: string; params: unknown[] } {
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
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.pool_type !== undefined) {
    columns.push("pool_type");
    values.push(data.pool_type);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.schema_version !== undefined) {
    columns.push("schema_version");
    values.push(data.schema_version);
    placeholders.push("?");
  }
  if (data.statistics !== undefined) {
    columns.push("statistics");
    values.push(JSON.stringify(data.statistics));
    placeholders.push("?");
  }

  const sql = `INSERT INTO data_pools (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: DataPoolsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.pool_type !== undefined) {
    sets.push("pool_type = ?");
    values.push(data.pool_type);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.schema_version !== undefined) {
    sets.push("schema_version = ?");
    values.push(data.schema_version);
  }
  if (data.statistics !== undefined) {
    sets.push("statistics = ?");
    values.push(JSON.stringify(data.statistics));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE data_pools SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class DataPoolsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): DataPools | null {
    return this.db.query<DataPools, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): DataPools[] {
    return this.db.query<DataPools, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: DataPoolsInsert): DataPools {
    const { sql, params } = buildInsert(data);
    return this.db.query<DataPools, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: DataPoolsUpdate, tenantId: string): DataPools | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<DataPools, unknown[]>(sql).get(...params) ?? null;
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