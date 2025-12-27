/**
 * Repository for ocel_events
 * Source: 03_ocel.sql
 */

import { Database } from "bun:sqlite";
import type { OcelEvents, OcelEventsInsert, OcelEventsUpdate } from "../types/ocel-events";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "ocel_events";

const SELECT_BY_ID = "SELECT * FROM ocel_events WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM ocel_events WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM ocel_events WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM ocel_events`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: OcelEventsInsert): { sql: string; params: unknown[] } {
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
  if (data.ocel_id !== undefined) {
    columns.push("ocel_id");
    values.push(data.ocel_id);
    placeholders.push("?");
  }
  if (data.event_type_id !== undefined) {
    columns.push("event_type_id");
    values.push(data.event_type_id);
    placeholders.push("?");
  }
  if (data.event_type_name !== undefined) {
    columns.push("event_type_name");
    values.push(data.event_type_name);
    placeholders.push("?");
  }
  if (data.timestamp !== undefined) {
    columns.push("timestamp");
    values.push(data.timestamp);
    placeholders.push("?");
  }
  if (data.attributes !== undefined) {
    columns.push("attributes");
    values.push(JSON.stringify(data.attributes));
    placeholders.push("?");
  }

  const sql = `INSERT INTO ocel_events (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: OcelEventsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.data_pool_id !== undefined) {
    sets.push("data_pool_id = ?");
    values.push(data.data_pool_id);
  }
  if (data.ocel_id !== undefined) {
    sets.push("ocel_id = ?");
    values.push(data.ocel_id);
  }
  if (data.event_type_id !== undefined) {
    sets.push("event_type_id = ?");
    values.push(data.event_type_id);
  }
  if (data.event_type_name !== undefined) {
    sets.push("event_type_name = ?");
    values.push(data.event_type_name);
  }
  if (data.timestamp !== undefined) {
    sets.push("timestamp = ?");
    values.push(data.timestamp);
  }
  if (data.attributes !== undefined) {
    sets.push("attributes = ?");
    values.push(JSON.stringify(data.attributes));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE ocel_events SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class OcelEventsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): OcelEvents | null {
    return this.db.query<OcelEvents, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): OcelEvents[] {
    return this.db.query<OcelEvents, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: OcelEventsInsert): OcelEvents {
    const { sql, params } = buildInsert(data);
    return this.db.query<OcelEvents, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: OcelEventsUpdate, tenantId: string): OcelEvents | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<OcelEvents, unknown[]>(sql).get(...params) ?? null;
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