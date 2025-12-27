/**
 * Repository for view_tabs
 * Source: 17_studio.sql
 */

import { Database } from "bun:sqlite";
import type { ViewTabs, ViewTabsInsert, ViewTabsUpdate } from "../types/view-tabs";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "view_tabs";

const SELECT_BY_ID = "SELECT * FROM view_tabs WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM view_tabs WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM view_tabs WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM view_tabs`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ViewTabsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.view_id !== undefined) {
    columns.push("view_id");
    values.push(data.view_id);
    placeholders.push("?");
  }
  if (data.key !== undefined) {
    columns.push("key");
    values.push(data.key);
    placeholders.push("?");
  }
  if (data.title !== undefined) {
    columns.push("title");
    values.push(data.title);
    placeholders.push("?");
  }
  if (data.icon !== undefined) {
    columns.push("icon");
    values.push(data.icon);
    placeholders.push("?");
  }
  if (data.is_default !== undefined) {
    columns.push("is_default");
    values.push(data.is_default);
    placeholders.push("?");
  }
  if (data.sort_order !== undefined) {
    columns.push("sort_order");
    values.push(data.sort_order);
    placeholders.push("?");
  }
  if (data.visibility_expression !== undefined) {
    columns.push("visibility_expression");
    values.push(data.visibility_expression);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO view_tabs (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ViewTabsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.view_id !== undefined) {
    sets.push("view_id = ?");
    values.push(data.view_id);
  }
  if (data.key !== undefined) {
    sets.push("key = ?");
    values.push(data.key);
  }
  if (data.title !== undefined) {
    sets.push("title = ?");
    values.push(data.title);
  }
  if (data.icon !== undefined) {
    sets.push("icon = ?");
    values.push(data.icon);
  }
  if (data.is_default !== undefined) {
    sets.push("is_default = ?");
    values.push(data.is_default);
  }
  if (data.sort_order !== undefined) {
    sets.push("sort_order = ?");
    values.push(data.sort_order);
  }
  if (data.visibility_expression !== undefined) {
    sets.push("visibility_expression = ?");
    values.push(data.visibility_expression);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE view_tabs SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ViewTabsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ViewTabs | null {
    return this.db.query<ViewTabs, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ViewTabs[] {
    return this.db.query<ViewTabs, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ViewTabsInsert): ViewTabs {
    const { sql, params } = buildInsert(data);
    return this.db.query<ViewTabs, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ViewTabsUpdate, tenantId: string): ViewTabs | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ViewTabs, unknown[]>(sql).get(...params) ?? null;
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