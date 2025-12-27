/**
 * Repository for event_types
 * Source: 19_ocpm_extended.sql
 */

import { Database } from "bun:sqlite";
import type { EventTypes, EventTypesInsert, EventTypesUpdate } from "../types/event-types";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "event_types";

const SELECT_BY_ID = "SELECT * FROM event_types WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM event_types WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM event_types WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM event_types`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: EventTypesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.perspective_id !== undefined) {
    columns.push("perspective_id");
    values.push(data.perspective_id);
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
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.source_table !== undefined) {
    columns.push("source_table");
    values.push(data.source_table);
    placeholders.push("?");
  }
  if (data.timestamp_column !== undefined) {
    columns.push("timestamp_column");
    values.push(data.timestamp_column);
    placeholders.push("?");
  }
  if (data.sorting_column !== undefined) {
    columns.push("sorting_column");
    values.push(data.sorting_column);
    placeholders.push("?");
  }
  if (data.icon !== undefined) {
    columns.push("icon");
    values.push(data.icon);
    placeholders.push("?");
  }
  if (data.color !== undefined) {
    columns.push("color");
    values.push(data.color);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.attribute_schema !== undefined) {
    columns.push("attribute_schema");
    values.push(JSON.stringify(data.attribute_schema));
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

  const sql = `INSERT INTO event_types (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: EventTypesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.perspective_id !== undefined) {
    sets.push("perspective_id = ?");
    values.push(data.perspective_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.display_name !== undefined) {
    sets.push("display_name = ?");
    values.push(data.display_name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.source_table !== undefined) {
    sets.push("source_table = ?");
    values.push(data.source_table);
  }
  if (data.timestamp_column !== undefined) {
    sets.push("timestamp_column = ?");
    values.push(data.timestamp_column);
  }
  if (data.sorting_column !== undefined) {
    sets.push("sorting_column = ?");
    values.push(data.sorting_column);
  }
  if (data.icon !== undefined) {
    sets.push("icon = ?");
    values.push(data.icon);
  }
  if (data.color !== undefined) {
    sets.push("color = ?");
    values.push(data.color);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.attribute_schema !== undefined) {
    sets.push("attribute_schema = ?");
    values.push(JSON.stringify(data.attribute_schema));
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
  const sql = `UPDATE event_types SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class EventTypesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): EventTypes | null {
    return this.db.query<EventTypes, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): EventTypes[] {
    return this.db.query<EventTypes, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: EventTypesInsert): EventTypes {
    const { sql, params } = buildInsert(data);
    return this.db.query<EventTypes, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: EventTypesUpdate, tenantId: string): EventTypes | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<EventTypes, unknown[]>(sql).get(...params) ?? null;
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