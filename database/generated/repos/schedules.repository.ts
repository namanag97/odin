/**
 * Repository for schedules
 * Source: 15_data_model.sql
 */

import { Database } from "bun:sqlite";
import type { Schedules, SchedulesInsert, SchedulesUpdate } from "../types/schedules";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "schedules";

const SELECT_BY_ID = "SELECT * FROM schedules WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM schedules WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM schedules WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM schedules`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: SchedulesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
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
  if (data.schedule_type !== undefined) {
    columns.push("schedule_type");
    values.push(data.schedule_type);
    placeholders.push("?");
  }
  if (data.cron_expression !== undefined) {
    columns.push("cron_expression");
    values.push(data.cron_expression);
    placeholders.push("?");
  }
  if (data.interval_seconds !== undefined) {
    columns.push("interval_seconds");
    values.push(data.interval_seconds);
    placeholders.push("?");
  }
  if (data.run_at !== undefined) {
    columns.push("run_at");
    values.push(data.run_at);
    placeholders.push("?");
  }
  if (data.timezone !== undefined) {
    columns.push("timezone");
    values.push(data.timezone);
    placeholders.push("?");
  }
  if (data.is_enabled !== undefined) {
    columns.push("is_enabled");
    values.push(data.is_enabled);
    placeholders.push("?");
  }
  if (data.last_triggered_at !== undefined) {
    columns.push("last_triggered_at");
    values.push(data.last_triggered_at);
    placeholders.push("?");
  }
  if (data.next_trigger_at !== undefined) {
    columns.push("next_trigger_at");
    values.push(data.next_trigger_at);
    placeholders.push("?");
  }
  if (data.created_by !== undefined) {
    columns.push("created_by");
    values.push(data.created_by);
    placeholders.push("?");
  }

  const sql = `INSERT INTO schedules (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: SchedulesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.schedule_type !== undefined) {
    sets.push("schedule_type = ?");
    values.push(data.schedule_type);
  }
  if (data.cron_expression !== undefined) {
    sets.push("cron_expression = ?");
    values.push(data.cron_expression);
  }
  if (data.interval_seconds !== undefined) {
    sets.push("interval_seconds = ?");
    values.push(data.interval_seconds);
  }
  if (data.run_at !== undefined) {
    sets.push("run_at = ?");
    values.push(data.run_at);
  }
  if (data.timezone !== undefined) {
    sets.push("timezone = ?");
    values.push(data.timezone);
  }
  if (data.is_enabled !== undefined) {
    sets.push("is_enabled = ?");
    values.push(data.is_enabled);
  }
  if (data.last_triggered_at !== undefined) {
    sets.push("last_triggered_at = ?");
    values.push(data.last_triggered_at);
  }
  if (data.next_trigger_at !== undefined) {
    sets.push("next_trigger_at = ?");
    values.push(data.next_trigger_at);
  }
  if (data.created_by !== undefined) {
    sets.push("created_by = ?");
    values.push(data.created_by);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE schedules SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class SchedulesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Schedules | null {
    return this.db.query<Schedules, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Schedules[] {
    return this.db.query<Schedules, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: SchedulesInsert): Schedules {
    const { sql, params } = buildInsert(data);
    return this.db.query<Schedules, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: SchedulesUpdate, tenantId: string): Schedules | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Schedules, unknown[]>(sql).get(...params) ?? null;
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