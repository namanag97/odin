/**
 * Repository for permissions
 * Source: 21_identity_layer.sql
 */

import { Database } from "bun:sqlite";
import type { Permissions, PermissionsInsert, PermissionsUpdate } from "../types/permissions";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "permissions";

const SELECT_BY_ID = "SELECT * FROM permissions WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM permissions WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM permissions";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM permissions`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: PermissionsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.resource !== undefined) {
    columns.push("resource");
    values.push(data.resource);
    placeholders.push("?");
  }
  if (data.action !== undefined) {
    columns.push("action");
    values.push(data.action);
    placeholders.push("?");
  }
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.category !== undefined) {
    columns.push("category");
    values.push(data.category);
    placeholders.push("?");
  }
  if (data.is_sensitive !== undefined) {
    columns.push("is_sensitive");
    values.push(data.is_sensitive);
    placeholders.push("?");
  }

  const sql = `INSERT INTO permissions (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: PermissionsUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.resource !== undefined) {
    sets.push("resource = ?");
    values.push(data.resource);
  }
  if (data.action !== undefined) {
    sets.push("action = ?");
    values.push(data.action);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.category !== undefined) {
    sets.push("category = ?");
    values.push(data.category);
  }
  if (data.is_sensitive !== undefined) {
    sets.push("is_sensitive = ?");
    values.push(data.is_sensitive);
  }

  values.push(id);
  const sql = `UPDATE permissions SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class PermissionsRepository {
  constructor(private db: Database) {}

  findById(id: string): Permissions | null {
    return this.db.query<Permissions, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): Permissions[] {
    return this.db.query<Permissions, []>(buildSelectAll(options)).all();
  }

  create(data: PermissionsInsert): Permissions {
    const { sql, params } = buildInsert(data);
    return this.db.query<Permissions, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: PermissionsUpdate): Permissions | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<Permissions, unknown[]>(sql).get(...params) ?? null;
  }

  delete(id: string): boolean {
    this.db.query(DELETE_BY_ID).run(id);
    return true;
  }

  count(): number {
    const result = this.db.query<{ count: number }, []>(COUNT_SQL).get();
    return result?.count ?? 0;
  }
}