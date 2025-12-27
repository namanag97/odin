/**
 * Repository for ocel_e2o
 * Source: 03_ocel.sql
 */

import { Database } from "bun:sqlite";
import type { OcelE2o, OcelE2oInsert, OcelE2oUpdate } from "../types/ocel-e2o";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "ocel_e2o";

const SELECT_BY_ID = "SELECT * FROM ocel_e2o WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM ocel_e2o WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM ocel_e2o WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM ocel_e2o`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: OcelE2oInsert): { sql: string; params: unknown[] } {
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
  if (data.event_id !== undefined) {
    columns.push("event_id");
    values.push(data.event_id);
    placeholders.push("?");
  }
  if (data.object_id !== undefined) {
    columns.push("object_id");
    values.push(data.object_id);
    placeholders.push("?");
  }
  if (data.qualifier !== undefined) {
    columns.push("qualifier");
    values.push(data.qualifier);
    placeholders.push("?");
  }
  if (data.qualifier_value !== undefined) {
    columns.push("qualifier_value");
    values.push(data.qualifier_value);
    placeholders.push("?");
  }

  const sql = `INSERT INTO ocel_e2o (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: OcelE2oUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.data_pool_id !== undefined) {
    sets.push("data_pool_id = ?");
    values.push(data.data_pool_id);
  }
  if (data.event_id !== undefined) {
    sets.push("event_id = ?");
    values.push(data.event_id);
  }
  if (data.object_id !== undefined) {
    sets.push("object_id = ?");
    values.push(data.object_id);
  }
  if (data.qualifier !== undefined) {
    sets.push("qualifier = ?");
    values.push(data.qualifier);
  }
  if (data.qualifier_value !== undefined) {
    sets.push("qualifier_value = ?");
    values.push(data.qualifier_value);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE ocel_e2o SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class OcelE2oRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): OcelE2o | null {
    return this.db.query<OcelE2o, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): OcelE2o[] {
    return this.db.query<OcelE2o, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: OcelE2oInsert): OcelE2o {
    const { sql, params } = buildInsert(data);
    return this.db.query<OcelE2o, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: OcelE2oUpdate, tenantId: string): OcelE2o | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<OcelE2o, unknown[]>(sql).get(...params) ?? null;
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