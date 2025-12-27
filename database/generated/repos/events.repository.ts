/**
 * Repository for events
 * Source: 02_case_centric.sql
 */

import { Database } from "bun:sqlite";
import type { Events, EventsInsert, EventsUpdate } from "../types/events";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "events";

const SELECT_BY_ID = "SELECT * FROM events WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM events WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM events WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM events`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: EventsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.event_log_id !== undefined) {
    columns.push("event_log_id");
    values.push(data.event_log_id);
    placeholders.push("?");
  }
  if (data.case_id !== undefined) {
    columns.push("case_id");
    values.push(data.case_id);
    placeholders.push("?");
  }
  if (data.activity_id !== undefined) {
    columns.push("activity_id");
    values.push(data.activity_id);
    placeholders.push("?");
  }
  if (data.activity_name !== undefined) {
    columns.push("activity_name");
    values.push(data.activity_name);
    placeholders.push("?");
  }
  if (data.timestamp !== undefined) {
    columns.push("timestamp");
    values.push(data.timestamp);
    placeholders.push("?");
  }
  if (data.sort_key !== undefined) {
    columns.push("sort_key");
    values.push(data.sort_key);
    placeholders.push("?");
  }
  if (data.resource_id !== undefined) {
    columns.push("resource_id");
    values.push(data.resource_id);
    placeholders.push("?");
  }
  if (data.resource_name !== undefined) {
    columns.push("resource_name");
    values.push(data.resource_name);
    placeholders.push("?");
  }
  if (data.lifecycle !== undefined) {
    columns.push("lifecycle");
    values.push(data.lifecycle);
    placeholders.push("?");
  }
  if (data.cost !== undefined) {
    columns.push("cost");
    values.push(data.cost);
    placeholders.push("?");
  }
  if (data.attributes !== undefined) {
    columns.push("attributes");
    values.push(JSON.stringify(data.attributes));
    placeholders.push("?");
  }

  const sql = `INSERT INTO events (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: EventsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.event_log_id !== undefined) {
    sets.push("event_log_id = ?");
    values.push(data.event_log_id);
  }
  if (data.case_id !== undefined) {
    sets.push("case_id = ?");
    values.push(data.case_id);
  }
  if (data.activity_id !== undefined) {
    sets.push("activity_id = ?");
    values.push(data.activity_id);
  }
  if (data.activity_name !== undefined) {
    sets.push("activity_name = ?");
    values.push(data.activity_name);
  }
  if (data.timestamp !== undefined) {
    sets.push("timestamp = ?");
    values.push(data.timestamp);
  }
  if (data.sort_key !== undefined) {
    sets.push("sort_key = ?");
    values.push(data.sort_key);
  }
  if (data.resource_id !== undefined) {
    sets.push("resource_id = ?");
    values.push(data.resource_id);
  }
  if (data.resource_name !== undefined) {
    sets.push("resource_name = ?");
    values.push(data.resource_name);
  }
  if (data.lifecycle !== undefined) {
    sets.push("lifecycle = ?");
    values.push(data.lifecycle);
  }
  if (data.cost !== undefined) {
    sets.push("cost = ?");
    values.push(data.cost);
  }
  if (data.attributes !== undefined) {
    sets.push("attributes = ?");
    values.push(JSON.stringify(data.attributes));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE events SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class EventsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Events | null {
    return this.db.query<Events, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Events[] {
    return this.db.query<Events, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: EventsInsert): Events {
    const { sql, params } = buildInsert(data);
    return this.db.query<Events, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: EventsUpdate, tenantId: string): Events | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Events, unknown[]>(sql).get(...params) ?? null;
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