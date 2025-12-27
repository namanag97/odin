/**
 * Repository for views
 * Source: 17_studio.sql
 */

import { Database } from "bun:sqlite";
import type { Views, ViewsInsert, ViewsUpdate } from "../types/views";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "views";

const SELECT_BY_ID = "SELECT * FROM views WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM views WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM views WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM views`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ViewsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.package_id !== undefined) {
    columns.push("package_id");
    values.push(data.package_id);
    placeholders.push("?");
  }
  if (data.key !== undefined) {
    columns.push("key");
    values.push(data.key);
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
  if (data.knowledge_model_id !== undefined) {
    columns.push("knowledge_model_id");
    values.push(data.knowledge_model_id);
    placeholders.push("?");
  }
  if (data.base_view_id !== undefined) {
    columns.push("base_view_id");
    values.push(data.base_view_id);
    placeholders.push("?");
  }
  if (data.view_type !== undefined) {
    columns.push("view_type");
    values.push(data.view_type);
    placeholders.push("?");
  }
  if (data.layout_mode !== undefined) {
    columns.push("layout_mode");
    values.push(data.layout_mode);
    placeholders.push("?");
  }
  if (data.layout_config !== undefined) {
    columns.push("layout_config");
    values.push(JSON.stringify(data.layout_config));
    placeholders.push("?");
  }
  if (data.icon !== undefined) {
    columns.push("icon");
    values.push(data.icon);
    placeholders.push("?");
  }
  if (data.thumbnail_url !== undefined) {
    columns.push("thumbnail_url");
    values.push(data.thumbnail_url);
    placeholders.push("?");
  }
  if (data.is_home !== undefined) {
    columns.push("is_home");
    values.push(data.is_home);
    placeholders.push("?");
  }
  if (data.is_published_to_apps !== undefined) {
    columns.push("is_published_to_apps");
    values.push(data.is_published_to_apps);
    placeholders.push("?");
  }
  if (data.sort_order !== undefined) {
    columns.push("sort_order");
    values.push(data.sort_order);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.version !== undefined) {
    columns.push("version");
    values.push(data.version);
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

  const sql = `INSERT INTO views (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ViewsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.package_id !== undefined) {
    sets.push("package_id = ?");
    values.push(data.package_id);
  }
  if (data.key !== undefined) {
    sets.push("key = ?");
    values.push(data.key);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.knowledge_model_id !== undefined) {
    sets.push("knowledge_model_id = ?");
    values.push(data.knowledge_model_id);
  }
  if (data.base_view_id !== undefined) {
    sets.push("base_view_id = ?");
    values.push(data.base_view_id);
  }
  if (data.view_type !== undefined) {
    sets.push("view_type = ?");
    values.push(data.view_type);
  }
  if (data.layout_mode !== undefined) {
    sets.push("layout_mode = ?");
    values.push(data.layout_mode);
  }
  if (data.layout_config !== undefined) {
    sets.push("layout_config = ?");
    values.push(JSON.stringify(data.layout_config));
  }
  if (data.icon !== undefined) {
    sets.push("icon = ?");
    values.push(data.icon);
  }
  if (data.thumbnail_url !== undefined) {
    sets.push("thumbnail_url = ?");
    values.push(data.thumbnail_url);
  }
  if (data.is_home !== undefined) {
    sets.push("is_home = ?");
    values.push(data.is_home);
  }
  if (data.is_published_to_apps !== undefined) {
    sets.push("is_published_to_apps = ?");
    values.push(data.is_published_to_apps);
  }
  if (data.sort_order !== undefined) {
    sets.push("sort_order = ?");
    values.push(data.sort_order);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.version !== undefined) {
    sets.push("version = ?");
    values.push(data.version);
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
  const sql = `UPDATE views SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ViewsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Views | null {
    return this.db.query<Views, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Views[] {
    return this.db.query<Views, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ViewsInsert): Views {
    const { sql, params } = buildInsert(data);
    return this.db.query<Views, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ViewsUpdate, tenantId: string): Views | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Views, unknown[]>(sql).get(...params) ?? null;
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