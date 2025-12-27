/**
 * Repository for ocel_o2o
 * Source: 03_ocel.sql
 */

import { Database } from "bun:sqlite";
import type { OcelO2o, OcelO2oInsert, OcelO2oUpdate } from "../types/ocel-o2o";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "ocel_o2o";

const SELECT_BY_ID = "SELECT * FROM ocel_o2o WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM ocel_o2o WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM ocel_o2o WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM ocel_o2o`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: OcelO2oInsert): { sql: string; params: unknown[] } {
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
  if (data.source_object_id !== undefined) {
    columns.push("source_object_id");
    values.push(data.source_object_id);
    placeholders.push("?");
  }
  if (data.target_object_id !== undefined) {
    columns.push("target_object_id");
    values.push(data.target_object_id);
    placeholders.push("?");
  }
  if (data.relationship_type !== undefined) {
    columns.push("relationship_type");
    values.push(data.relationship_type);
    placeholders.push("?");
  }
  if (data.attributes !== undefined) {
    columns.push("attributes");
    values.push(JSON.stringify(data.attributes));
    placeholders.push("?");
  }
  if (data.valid_from !== undefined) {
    columns.push("valid_from");
    values.push(data.valid_from);
    placeholders.push("?");
  }
  if (data.valid_to !== undefined) {
    columns.push("valid_to");
    values.push(data.valid_to);
    placeholders.push("?");
  }

  const sql = `INSERT INTO ocel_o2o (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: OcelO2oUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.data_pool_id !== undefined) {
    sets.push("data_pool_id = ?");
    values.push(data.data_pool_id);
  }
  if (data.source_object_id !== undefined) {
    sets.push("source_object_id = ?");
    values.push(data.source_object_id);
  }
  if (data.target_object_id !== undefined) {
    sets.push("target_object_id = ?");
    values.push(data.target_object_id);
  }
  if (data.relationship_type !== undefined) {
    sets.push("relationship_type = ?");
    values.push(data.relationship_type);
  }
  if (data.attributes !== undefined) {
    sets.push("attributes = ?");
    values.push(JSON.stringify(data.attributes));
  }
  if (data.valid_from !== undefined) {
    sets.push("valid_from = ?");
    values.push(data.valid_from);
  }
  if (data.valid_to !== undefined) {
    sets.push("valid_to = ?");
    values.push(data.valid_to);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE ocel_o2o SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class OcelO2oRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): OcelO2o | null {
    return this.db.query<OcelO2o, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): OcelO2o[] {
    return this.db.query<OcelO2o, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: OcelO2oInsert): OcelO2o {
    const { sql, params } = buildInsert(data);
    return this.db.query<OcelO2o, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: OcelO2oUpdate, tenantId: string): OcelO2o | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<OcelO2o, unknown[]>(sql).get(...params) ?? null;
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