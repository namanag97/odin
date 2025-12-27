/**
 * Repository for event_log_configs
 * Source: 16_semantic.sql
 */

import { Database } from "bun:sqlite";
import type { EventLogConfigs, EventLogConfigsInsert, EventLogConfigsUpdate } from "../types/event-log-configs";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "event_log_configs";

const SELECT_BY_ID = "SELECT * FROM event_log_configs WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM event_log_configs WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM event_log_configs WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM event_log_configs`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: EventLogConfigsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.knowledge_model_id !== undefined) {
    columns.push("knowledge_model_id");
    values.push(data.knowledge_model_id);
    placeholders.push("?");
  }
  if (data.key !== undefined) {
    columns.push("key");
    values.push(data.key);
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
  if (data.activity_table !== undefined) {
    columns.push("activity_table");
    values.push(data.activity_table);
    placeholders.push("?");
  }
  if (data.case_id_column !== undefined) {
    columns.push("case_id_column");
    values.push(data.case_id_column);
    placeholders.push("?");
  }
  if (data.activity_column !== undefined) {
    columns.push("activity_column");
    values.push(data.activity_column);
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
  if (data.resource_column !== undefined) {
    columns.push("resource_column");
    values.push(data.resource_column);
    placeholders.push("?");
  }
  if (data.cost_column !== undefined) {
    columns.push("cost_column");
    values.push(data.cost_column);
    placeholders.push("?");
  }
  if (data.included_activities !== undefined) {
    columns.push("included_activities");
    values.push(JSON.stringify(data.included_activities));
    placeholders.push("?");
  }
  if (data.excluded_activities !== undefined) {
    columns.push("excluded_activities");
    values.push(JSON.stringify(data.excluded_activities));
    placeholders.push("?");
  }
  if (data.filter_expression !== undefined) {
    columns.push("filter_expression");
    values.push(data.filter_expression);
    placeholders.push("?");
  }
  if (data.is_default !== undefined) {
    columns.push("is_default");
    values.push(data.is_default);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO event_log_configs (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: EventLogConfigsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.knowledge_model_id !== undefined) {
    sets.push("knowledge_model_id = ?");
    values.push(data.knowledge_model_id);
  }
  if (data.key !== undefined) {
    sets.push("key = ?");
    values.push(data.key);
  }
  if (data.display_name !== undefined) {
    sets.push("display_name = ?");
    values.push(data.display_name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.activity_table !== undefined) {
    sets.push("activity_table = ?");
    values.push(data.activity_table);
  }
  if (data.case_id_column !== undefined) {
    sets.push("case_id_column = ?");
    values.push(data.case_id_column);
  }
  if (data.activity_column !== undefined) {
    sets.push("activity_column = ?");
    values.push(data.activity_column);
  }
  if (data.timestamp_column !== undefined) {
    sets.push("timestamp_column = ?");
    values.push(data.timestamp_column);
  }
  if (data.sorting_column !== undefined) {
    sets.push("sorting_column = ?");
    values.push(data.sorting_column);
  }
  if (data.resource_column !== undefined) {
    sets.push("resource_column = ?");
    values.push(data.resource_column);
  }
  if (data.cost_column !== undefined) {
    sets.push("cost_column = ?");
    values.push(data.cost_column);
  }
  if (data.included_activities !== undefined) {
    sets.push("included_activities = ?");
    values.push(JSON.stringify(data.included_activities));
  }
  if (data.excluded_activities !== undefined) {
    sets.push("excluded_activities = ?");
    values.push(JSON.stringify(data.excluded_activities));
  }
  if (data.filter_expression !== undefined) {
    sets.push("filter_expression = ?");
    values.push(data.filter_expression);
  }
  if (data.is_default !== undefined) {
    sets.push("is_default = ?");
    values.push(data.is_default);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE event_log_configs SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class EventLogConfigsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): EventLogConfigs | null {
    return this.db.query<EventLogConfigs, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): EventLogConfigs[] {
    return this.db.query<EventLogConfigs, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: EventLogConfigsInsert): EventLogConfigs {
    const { sql, params } = buildInsert(data);
    return this.db.query<EventLogConfigs, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: EventLogConfigsUpdate, tenantId: string): EventLogConfigs | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<EventLogConfigs, unknown[]>(sql).get(...params) ?? null;
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