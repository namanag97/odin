/**
 * Repository for activities
 * Source: 02_case_centric.sql
 */

import { Database } from "bun:sqlite";
import type { Activities, ActivitiesInsert, ActivitiesUpdate } from "../types/activities";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "activities";

const SELECT_BY_ID = "SELECT * FROM activities WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM activities WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM activities WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM activities`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ActivitiesInsert): { sql: string; params: unknown[] } {
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
  if (data.category !== undefined) {
    columns.push("category");
    values.push(data.category);
    placeholders.push("?");
  }
  if (data.is_automated !== undefined) {
    columns.push("is_automated");
    values.push(data.is_automated);
    placeholders.push("?");
  }
  if (data.avg_duration_seconds !== undefined) {
    columns.push("avg_duration_seconds");
    values.push(data.avg_duration_seconds);
    placeholders.push("?");
  }
  if (data.avg_cost !== undefined) {
    columns.push("avg_cost");
    values.push(data.avg_cost);
    placeholders.push("?");
  }
  if (data.occurrence_count !== undefined) {
    columns.push("occurrence_count");
    values.push(data.occurrence_count);
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
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO activities (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ActivitiesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.event_log_id !== undefined) {
    sets.push("event_log_id = ?");
    values.push(data.event_log_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.display_name !== undefined) {
    sets.push("display_name = ?");
    values.push(data.display_name);
  }
  if (data.category !== undefined) {
    sets.push("category = ?");
    values.push(data.category);
  }
  if (data.is_automated !== undefined) {
    sets.push("is_automated = ?");
    values.push(data.is_automated);
  }
  if (data.avg_duration_seconds !== undefined) {
    sets.push("avg_duration_seconds = ?");
    values.push(data.avg_duration_seconds);
  }
  if (data.avg_cost !== undefined) {
    sets.push("avg_cost = ?");
    values.push(data.avg_cost);
  }
  if (data.occurrence_count !== undefined) {
    sets.push("occurrence_count = ?");
    values.push(data.occurrence_count);
  }
  if (data.icon !== undefined) {
    sets.push("icon = ?");
    values.push(data.icon);
  }
  if (data.color !== undefined) {
    sets.push("color = ?");
    values.push(data.color);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE activities SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ActivitiesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Activities | null {
    return this.db.query<Activities, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Activities[] {
    return this.db.query<Activities, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ActivitiesInsert): Activities {
    const { sql, params } = buildInsert(data);
    return this.db.query<Activities, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ActivitiesUpdate, tenantId: string): Activities | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Activities, unknown[]>(sql).get(...params) ?? null;
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