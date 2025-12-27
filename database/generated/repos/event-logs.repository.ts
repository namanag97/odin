/**
 * Repository for event_logs
 * Source: 02_case_centric.sql
 */

import { Database } from "bun:sqlite";
import type { EventLogs, EventLogsInsert, EventLogsUpdate } from "../types/event-logs";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "event_logs";

const SELECT_BY_ID = "SELECT * FROM event_logs WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM event_logs WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM event_logs WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM event_logs`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: EventLogsInsert): { sql: string; params: unknown[] } {
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
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.case_notion !== undefined) {
    columns.push("case_notion");
    values.push(data.case_notion);
    placeholders.push("?");
  }
  if (data.activity_key !== undefined) {
    columns.push("activity_key");
    values.push(data.activity_key);
    placeholders.push("?");
  }
  if (data.timestamp_key !== undefined) {
    columns.push("timestamp_key");
    values.push(data.timestamp_key);
    placeholders.push("?");
  }
  if (data.resource_key !== undefined) {
    columns.push("resource_key");
    values.push(data.resource_key);
    placeholders.push("?");
  }
  if (data.case_attributes !== undefined) {
    columns.push("case_attributes");
    values.push(JSON.stringify(data.case_attributes));
    placeholders.push("?");
  }
  if (data.event_attributes !== undefined) {
    columns.push("event_attributes");
    values.push(JSON.stringify(data.event_attributes));
    placeholders.push("?");
  }
  if (data.classifiers !== undefined) {
    columns.push("classifiers");
    values.push(JSON.stringify(data.classifiers));
    placeholders.push("?");
  }
  if (data.extensions !== undefined) {
    columns.push("extensions");
    values.push(JSON.stringify(data.extensions));
    placeholders.push("?");
  }
  if (data.global_attributes !== undefined) {
    columns.push("global_attributes");
    values.push(JSON.stringify(data.global_attributes));
    placeholders.push("?");
  }
  if (data.statistics !== undefined) {
    columns.push("statistics");
    values.push(JSON.stringify(data.statistics));
    placeholders.push("?");
  }
  if (data.source_file_path !== undefined) {
    columns.push("source_file_path");
    values.push(data.source_file_path);
    placeholders.push("?");
  }
  if (data.source_file_format !== undefined) {
    columns.push("source_file_format");
    values.push(data.source_file_format);
    placeholders.push("?");
  }

  const sql = `INSERT INTO event_logs (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: EventLogsUpdate, tenantId: string): { sql: string; params: unknown[] } {
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
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.case_notion !== undefined) {
    sets.push("case_notion = ?");
    values.push(data.case_notion);
  }
  if (data.activity_key !== undefined) {
    sets.push("activity_key = ?");
    values.push(data.activity_key);
  }
  if (data.timestamp_key !== undefined) {
    sets.push("timestamp_key = ?");
    values.push(data.timestamp_key);
  }
  if (data.resource_key !== undefined) {
    sets.push("resource_key = ?");
    values.push(data.resource_key);
  }
  if (data.case_attributes !== undefined) {
    sets.push("case_attributes = ?");
    values.push(JSON.stringify(data.case_attributes));
  }
  if (data.event_attributes !== undefined) {
    sets.push("event_attributes = ?");
    values.push(JSON.stringify(data.event_attributes));
  }
  if (data.classifiers !== undefined) {
    sets.push("classifiers = ?");
    values.push(JSON.stringify(data.classifiers));
  }
  if (data.extensions !== undefined) {
    sets.push("extensions = ?");
    values.push(JSON.stringify(data.extensions));
  }
  if (data.global_attributes !== undefined) {
    sets.push("global_attributes = ?");
    values.push(JSON.stringify(data.global_attributes));
  }
  if (data.statistics !== undefined) {
    sets.push("statistics = ?");
    values.push(JSON.stringify(data.statistics));
  }
  if (data.source_file_path !== undefined) {
    sets.push("source_file_path = ?");
    values.push(data.source_file_path);
  }
  if (data.source_file_format !== undefined) {
    sets.push("source_file_format = ?");
    values.push(data.source_file_format);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE event_logs SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class EventLogsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): EventLogs | null {
    return this.db.query<EventLogs, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): EventLogs[] {
    return this.db.query<EventLogs, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: EventLogsInsert): EventLogs {
    const { sql, params } = buildInsert(data);
    return this.db.query<EventLogs, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: EventLogsUpdate, tenantId: string): EventLogs | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<EventLogs, unknown[]>(sql).get(...params) ?? null;
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