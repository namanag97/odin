/**
 * Repository for custom_event_logs
 * Source: 19_ocpm_extended.sql
 */

import { Database } from "bun:sqlite";
import type { CustomEventLogs, CustomEventLogsInsert, CustomEventLogsUpdate } from "../types/custom-event-logs";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "custom_event_logs";

const SELECT_BY_ID = "SELECT * FROM custom_event_logs WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM custom_event_logs WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM custom_event_logs WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM custom_event_logs`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: CustomEventLogsInsert): { sql: string; params: unknown[] } {
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
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.lead_object_type_id !== undefined) {
    columns.push("lead_object_type_id");
    values.push(data.lead_object_type_id);
    placeholders.push("?");
  }
  if (data.included_event_types !== undefined) {
    columns.push("included_event_types");
    values.push(JSON.stringify(data.included_event_types));
    placeholders.push("?");
  }
  if (data.flattening_strategy !== undefined) {
    columns.push("flattening_strategy");
    values.push(data.flattening_strategy);
    placeholders.push("?");
  }
  if (data.filter_expression !== undefined) {
    columns.push("filter_expression");
    values.push(data.filter_expression);
    placeholders.push("?");
  }
  if (data.is_materialized !== undefined) {
    columns.push("is_materialized");
    values.push(data.is_materialized);
    placeholders.push("?");
  }
  if (data.last_materialized_at !== undefined) {
    columns.push("last_materialized_at");
    values.push(data.last_materialized_at);
    placeholders.push("?");
  }
  if (data.row_count !== undefined) {
    columns.push("row_count");
    values.push(data.row_count);
    placeholders.push("?");
  }
  if (data.created_by !== undefined) {
    columns.push("created_by");
    values.push(data.created_by);
    placeholders.push("?");
  }

  const sql = `INSERT INTO custom_event_logs (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: CustomEventLogsUpdate, tenantId: string): { sql: string; params: unknown[] } {
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
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.lead_object_type_id !== undefined) {
    sets.push("lead_object_type_id = ?");
    values.push(data.lead_object_type_id);
  }
  if (data.included_event_types !== undefined) {
    sets.push("included_event_types = ?");
    values.push(JSON.stringify(data.included_event_types));
  }
  if (data.flattening_strategy !== undefined) {
    sets.push("flattening_strategy = ?");
    values.push(data.flattening_strategy);
  }
  if (data.filter_expression !== undefined) {
    sets.push("filter_expression = ?");
    values.push(data.filter_expression);
  }
  if (data.is_materialized !== undefined) {
    sets.push("is_materialized = ?");
    values.push(data.is_materialized);
  }
  if (data.last_materialized_at !== undefined) {
    sets.push("last_materialized_at = ?");
    values.push(data.last_materialized_at);
  }
  if (data.row_count !== undefined) {
    sets.push("row_count = ?");
    values.push(data.row_count);
  }
  if (data.created_by !== undefined) {
    sets.push("created_by = ?");
    values.push(data.created_by);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE custom_event_logs SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class CustomEventLogsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): CustomEventLogs | null {
    return this.db.query<CustomEventLogs, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): CustomEventLogs[] {
    return this.db.query<CustomEventLogs, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: CustomEventLogsInsert): CustomEventLogs {
    const { sql, params } = buildInsert(data);
    return this.db.query<CustomEventLogs, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: CustomEventLogsUpdate, tenantId: string): CustomEventLogs | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<CustomEventLogs, unknown[]>(sql).get(...params) ?? null;
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