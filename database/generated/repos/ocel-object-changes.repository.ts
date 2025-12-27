/**
 * Repository for ocel_object_changes
 * Source: 03_ocel.sql
 */

import { Database } from "bun:sqlite";
import type { OcelObjectChanges, OcelObjectChangesInsert, OcelObjectChangesUpdate } from "../types/ocel-object-changes";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "ocel_object_changes";

const SELECT_BY_ID = "SELECT * FROM ocel_object_changes WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM ocel_object_changes WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM ocel_object_changes WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM ocel_object_changes`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: OcelObjectChangesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.object_id !== undefined) {
    columns.push("object_id");
    values.push(data.object_id);
    placeholders.push("?");
  }
  if (data.event_id !== undefined) {
    columns.push("event_id");
    values.push(data.event_id);
    placeholders.push("?");
  }
  if (data.attribute_name !== undefined) {
    columns.push("attribute_name");
    values.push(data.attribute_name);
    placeholders.push("?");
  }
  if (data.old_value !== undefined) {
    columns.push("old_value");
    values.push(data.old_value);
    placeholders.push("?");
  }
  if (data.new_value !== undefined) {
    columns.push("new_value");
    values.push(data.new_value);
    placeholders.push("?");
  }
  if (data.changed_at !== undefined) {
    columns.push("changed_at");
    values.push(data.changed_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO ocel_object_changes (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: OcelObjectChangesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.object_id !== undefined) {
    sets.push("object_id = ?");
    values.push(data.object_id);
  }
  if (data.event_id !== undefined) {
    sets.push("event_id = ?");
    values.push(data.event_id);
  }
  if (data.attribute_name !== undefined) {
    sets.push("attribute_name = ?");
    values.push(data.attribute_name);
  }
  if (data.old_value !== undefined) {
    sets.push("old_value = ?");
    values.push(data.old_value);
  }
  if (data.new_value !== undefined) {
    sets.push("new_value = ?");
    values.push(data.new_value);
  }
  if (data.changed_at !== undefined) {
    sets.push("changed_at = ?");
    values.push(data.changed_at);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE ocel_object_changes SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class OcelObjectChangesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): OcelObjectChanges | null {
    return this.db.query<OcelObjectChanges, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): OcelObjectChanges[] {
    return this.db.query<OcelObjectChanges, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: OcelObjectChangesInsert): OcelObjectChanges {
    const { sql, params } = buildInsert(data);
    return this.db.query<OcelObjectChanges, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: OcelObjectChangesUpdate, tenantId: string): OcelObjectChanges | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<OcelObjectChanges, unknown[]>(sql).get(...params) ?? null;
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