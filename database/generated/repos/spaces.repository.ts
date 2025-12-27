/**
 * Repository for spaces
 * Source: 17_studio.sql
 */

import { Database } from "bun:sqlite";
import type { Spaces, SpacesInsert, SpacesUpdate } from "../types/spaces";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "spaces";

const SELECT_BY_ID = "SELECT * FROM spaces WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM spaces WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM spaces WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM spaces`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: SpacesInsert): { sql: string; params: unknown[] } {
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
  if (data.is_default !== undefined) {
    columns.push("is_default");
    values.push(data.is_default);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
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
  if (data.created_by !== undefined) {
    columns.push("created_by");
    values.push(data.created_by);
    placeholders.push("?");
  }

  const sql = `INSERT INTO spaces (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: SpacesUpdate, tenantId: string): { sql: string; params: unknown[] } {
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
  if (data.icon !== undefined) {
    sets.push("icon = ?");
    values.push(data.icon);
  }
  if (data.color !== undefined) {
    sets.push("color = ?");
    values.push(data.color);
  }
  if (data.is_default !== undefined) {
    sets.push("is_default = ?");
    values.push(data.is_default);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.sort_order !== undefined) {
    sets.push("sort_order = ?");
    values.push(data.sort_order);
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
  const sql = `UPDATE spaces SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class SpacesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Spaces | null {
    return this.db.query<Spaces, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Spaces[] {
    return this.db.query<Spaces, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: SpacesInsert): Spaces {
    const { sql, params } = buildInsert(data);
    return this.db.query<Spaces, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: SpacesUpdate, tenantId: string): Spaces | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Spaces, unknown[]>(sql).get(...params) ?? null;
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