/**
 * Repository for components
 * Source: 17_studio.sql
 */

import { Database } from "bun:sqlite";
import type { Components, ComponentsInsert, ComponentsUpdate } from "../types/components";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "components";

const SELECT_BY_ID = "SELECT * FROM components WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM components WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM components WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM components`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ComponentsInsert): { sql: string; params: unknown[] } {
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
  if (data.parent_id !== undefined) {
    columns.push("parent_id");
    values.push(data.parent_id);
    placeholders.push("?");
  }
  if (data.component_type !== undefined) {
    columns.push("component_type");
    values.push(data.component_type);
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
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.layout_position !== undefined) {
    columns.push("layout_position");
    values.push(data.layout_position);
    placeholders.push("?");
  }
  if (data.data_config !== undefined) {
    columns.push("data_config");
    values.push(JSON.stringify(data.data_config));
    placeholders.push("?");
  }
  if (data.visual_config !== undefined) {
    columns.push("visual_config");
    values.push(JSON.stringify(data.visual_config));
    placeholders.push("?");
  }
  if (data.interaction_config !== undefined) {
    columns.push("interaction_config");
    values.push(JSON.stringify(data.interaction_config));
    placeholders.push("?");
  }
  if (data.is_visible !== undefined) {
    columns.push("is_visible");
    values.push(data.is_visible);
    placeholders.push("?");
  }
  if (data.visibility_expression !== undefined) {
    columns.push("visibility_expression");
    values.push(data.visibility_expression);
    placeholders.push("?");
  }
  if (data.sort_order !== undefined) {
    columns.push("sort_order");
    values.push(data.sort_order);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO components (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ComponentsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.view_id !== undefined) {
    sets.push("view_id = ?");
    values.push(data.view_id);
  }
  if (data.parent_id !== undefined) {
    sets.push("parent_id = ?");
    values.push(data.parent_id);
  }
  if (data.component_type !== undefined) {
    sets.push("component_type = ?");
    values.push(data.component_type);
  }
  if (data.key !== undefined) {
    sets.push("key = ?");
    values.push(data.key);
  }
  if (data.title !== undefined) {
    sets.push("title = ?");
    values.push(data.title);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.layout_position !== undefined) {
    sets.push("layout_position = ?");
    values.push(data.layout_position);
  }
  if (data.data_config !== undefined) {
    sets.push("data_config = ?");
    values.push(JSON.stringify(data.data_config));
  }
  if (data.visual_config !== undefined) {
    sets.push("visual_config = ?");
    values.push(JSON.stringify(data.visual_config));
  }
  if (data.interaction_config !== undefined) {
    sets.push("interaction_config = ?");
    values.push(JSON.stringify(data.interaction_config));
  }
  if (data.is_visible !== undefined) {
    sets.push("is_visible = ?");
    values.push(data.is_visible);
  }
  if (data.visibility_expression !== undefined) {
    sets.push("visibility_expression = ?");
    values.push(data.visibility_expression);
  }
  if (data.sort_order !== undefined) {
    sets.push("sort_order = ?");
    values.push(data.sort_order);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE components SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ComponentsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Components | null {
    return this.db.query<Components, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Components[] {
    return this.db.query<Components, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ComponentsInsert): Components {
    const { sql, params } = buildInsert(data);
    return this.db.query<Components, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ComponentsUpdate, tenantId: string): Components | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Components, unknown[]>(sql).get(...params) ?? null;
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