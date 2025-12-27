/**
 * Repository for dashboards
 * Source: 07_analytics.sql
 */

import { Database } from "bun:sqlite";
import type { Dashboards, DashboardsInsert, DashboardsUpdate } from "../types/dashboards";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "dashboards";

const SELECT_BY_ID = "SELECT * FROM dashboards WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM dashboards WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM dashboards WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM dashboards`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: DashboardsInsert): { sql: string; params: unknown[] } {
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
  if (data.layout !== undefined) {
    columns.push("layout");
    values.push(data.layout);
    placeholders.push("?");
  }
  if (data.widgets !== undefined) {
    columns.push("widgets");
    values.push(data.widgets);
    placeholders.push("?");
  }
  if (data.filters !== undefined) {
    columns.push("filters");
    values.push(JSON.stringify(data.filters));
    placeholders.push("?");
  }
  if (data.refresh_interval_seconds !== undefined) {
    columns.push("refresh_interval_seconds");
    values.push(data.refresh_interval_seconds);
    placeholders.push("?");
  }
  if (data.is_public !== undefined) {
    columns.push("is_public");
    values.push(data.is_public);
    placeholders.push("?");
  }

  const sql = `INSERT INTO dashboards (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: DashboardsUpdate, tenantId: string): { sql: string; params: unknown[] } {
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
  if (data.layout !== undefined) {
    sets.push("layout = ?");
    values.push(data.layout);
  }
  if (data.widgets !== undefined) {
    sets.push("widgets = ?");
    values.push(data.widgets);
  }
  if (data.filters !== undefined) {
    sets.push("filters = ?");
    values.push(JSON.stringify(data.filters));
  }
  if (data.refresh_interval_seconds !== undefined) {
    sets.push("refresh_interval_seconds = ?");
    values.push(data.refresh_interval_seconds);
  }
  if (data.is_public !== undefined) {
    sets.push("is_public = ?");
    values.push(data.is_public);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE dashboards SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class DashboardsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Dashboards | null {
    return this.db.query<Dashboards, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Dashboards[] {
    return this.db.query<Dashboards, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: DashboardsInsert): Dashboards {
    const { sql, params } = buildInsert(data);
    return this.db.query<Dashboards, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: DashboardsUpdate, tenantId: string): Dashboards | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Dashboards, unknown[]>(sql).get(...params) ?? null;
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