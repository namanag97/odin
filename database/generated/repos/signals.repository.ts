/**
 * Repository for signals
 * Source: 18_automation_enhanced.sql
 */

import { Database } from "bun:sqlite";
import type { Signals, SignalsInsert, SignalsUpdate } from "../types/signals";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "signals";

const SELECT_BY_ID = "SELECT * FROM signals WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM signals WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM signals WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM signals`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: SignalsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.sensor_id !== undefined) {
    columns.push("sensor_id");
    values.push(data.sensor_id);
    placeholders.push("?");
  }
  if (data.skill_id !== undefined) {
    columns.push("skill_id");
    values.push(data.skill_id);
    placeholders.push("?");
  }
  if (data.record_key !== undefined) {
    columns.push("record_key");
    values.push(data.record_key);
    placeholders.push("?");
  }
  if (data.signal_data !== undefined) {
    columns.push("signal_data");
    values.push(data.signal_data);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.priority !== undefined) {
    columns.push("priority");
    values.push(data.priority);
    placeholders.push("?");
  }
  if (data.assignee_id !== undefined) {
    columns.push("assignee_id");
    values.push(data.assignee_id);
    placeholders.push("?");
  }
  if (data.assigned_at !== undefined) {
    columns.push("assigned_at");
    values.push(data.assigned_at);
    placeholders.push("?");
  }
  if (data.snoozed_until !== undefined) {
    columns.push("snoozed_until");
    values.push(data.snoozed_until);
    placeholders.push("?");
  }
  if (data.resolved_at !== undefined) {
    columns.push("resolved_at");
    values.push(data.resolved_at);
    placeholders.push("?");
  }
  if (data.resolved_by !== undefined) {
    columns.push("resolved_by");
    values.push(data.resolved_by);
    placeholders.push("?");
  }
  if (data.resolution_notes !== undefined) {
    columns.push("resolution_notes");
    values.push(data.resolution_notes);
    placeholders.push("?");
  }
  if (data.task_id !== undefined) {
    columns.push("task_id");
    values.push(data.task_id);
    placeholders.push("?");
  }
  if (data.source_view_id !== undefined) {
    columns.push("source_view_id");
    values.push(data.source_view_id);
    placeholders.push("?");
  }
  if (data.detected_at !== undefined) {
    columns.push("detected_at");
    values.push(data.detected_at);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO signals (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: SignalsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.sensor_id !== undefined) {
    sets.push("sensor_id = ?");
    values.push(data.sensor_id);
  }
  if (data.skill_id !== undefined) {
    sets.push("skill_id = ?");
    values.push(data.skill_id);
  }
  if (data.record_key !== undefined) {
    sets.push("record_key = ?");
    values.push(data.record_key);
  }
  if (data.signal_data !== undefined) {
    sets.push("signal_data = ?");
    values.push(data.signal_data);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.priority !== undefined) {
    sets.push("priority = ?");
    values.push(data.priority);
  }
  if (data.assignee_id !== undefined) {
    sets.push("assignee_id = ?");
    values.push(data.assignee_id);
  }
  if (data.assigned_at !== undefined) {
    sets.push("assigned_at = ?");
    values.push(data.assigned_at);
  }
  if (data.snoozed_until !== undefined) {
    sets.push("snoozed_until = ?");
    values.push(data.snoozed_until);
  }
  if (data.resolved_at !== undefined) {
    sets.push("resolved_at = ?");
    values.push(data.resolved_at);
  }
  if (data.resolved_by !== undefined) {
    sets.push("resolved_by = ?");
    values.push(data.resolved_by);
  }
  if (data.resolution_notes !== undefined) {
    sets.push("resolution_notes = ?");
    values.push(data.resolution_notes);
  }
  if (data.task_id !== undefined) {
    sets.push("task_id = ?");
    values.push(data.task_id);
  }
  if (data.source_view_id !== undefined) {
    sets.push("source_view_id = ?");
    values.push(data.source_view_id);
  }
  if (data.detected_at !== undefined) {
    sets.push("detected_at = ?");
    values.push(data.detected_at);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE signals SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class SignalsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Signals | null {
    return this.db.query<Signals, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Signals[] {
    return this.db.query<Signals, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: SignalsInsert): Signals {
    const { sql, params } = buildInsert(data);
    return this.db.query<Signals, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: SignalsUpdate, tenantId: string): Signals | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Signals, unknown[]>(sql).get(...params) ?? null;
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