/**
 * Repository for ocel_event_types
 * Source: 03_ocel.sql
 */

import { Database } from "bun:sqlite";
import type { OcelEventTypes, OcelEventTypesInsert, OcelEventTypesUpdate } from "../types/ocel-event-types";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "ocel_event_types";

const SELECT_BY_ID = "SELECT * FROM ocel_event_types WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM ocel_event_types WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM ocel_event_types WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM ocel_event_types`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: OcelEventTypesInsert): { sql: string; params: unknown[] } {
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
  if (data.display_name !== undefined) {
    columns.push("display_name");
    values.push(data.display_name);
    placeholders.push("?");
  }
  if (data.attribute_schema !== undefined) {
    columns.push("attribute_schema");
    values.push(data.attribute_schema);
    placeholders.push("?");
  }
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.category !== undefined) {
    columns.push("category");
    values.push(data.category);
    placeholders.push("?");
  }
  if (data.color !== undefined) {
    columns.push("color");
    values.push(data.color);
    placeholders.push("?");
  }
  if (data.occurrence_count !== undefined) {
    columns.push("occurrence_count");
    values.push(data.occurrence_count);
    placeholders.push("?");
  }

  const sql = `INSERT INTO ocel_event_types (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: OcelEventTypesUpdate, tenantId: string): { sql: string; params: unknown[] } {
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
  if (data.display_name !== undefined) {
    sets.push("display_name = ?");
    values.push(data.display_name);
  }
  if (data.attribute_schema !== undefined) {
    sets.push("attribute_schema = ?");
    values.push(data.attribute_schema);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.category !== undefined) {
    sets.push("category = ?");
    values.push(data.category);
  }
  if (data.color !== undefined) {
    sets.push("color = ?");
    values.push(data.color);
  }
  if (data.occurrence_count !== undefined) {
    sets.push("occurrence_count = ?");
    values.push(data.occurrence_count);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE ocel_event_types SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class OcelEventTypesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): OcelEventTypes | null {
    return this.db.query<OcelEventTypes, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): OcelEventTypes[] {
    return this.db.query<OcelEventTypes, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: OcelEventTypesInsert): OcelEventTypes {
    const { sql, params } = buildInsert(data);
    return this.db.query<OcelEventTypes, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: OcelEventTypesUpdate, tenantId: string): OcelEventTypes | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<OcelEventTypes, unknown[]>(sql).get(...params) ?? null;
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