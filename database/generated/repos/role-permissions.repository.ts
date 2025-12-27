/**
 * Repository for role_permissions
 * Source: 21_identity_layer.sql
 */

import { Database } from "bun:sqlite";
import type { RolePermissions, RolePermissionsInsert, RolePermissionsUpdate } from "../types/role-permissions";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "role_permissions";

const SELECT_BY_ID = "SELECT * FROM role_permissions WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM role_permissions WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM role_permissions";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM role_permissions`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: RolePermissionsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.role_id !== undefined) {
    columns.push("role_id");
    values.push(data.role_id);
    placeholders.push("?");
  }
  if (data.permission_id !== undefined) {
    columns.push("permission_id");
    values.push(data.permission_id);
    placeholders.push("?");
  }
  if (data.conditions !== undefined) {
    columns.push("conditions");
    values.push(data.conditions);
    placeholders.push("?");
  }
  if (data.granted_at !== undefined) {
    columns.push("granted_at");
    values.push(data.granted_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO role_permissions (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: RolePermissionsUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.role_id !== undefined) {
    sets.push("role_id = ?");
    values.push(data.role_id);
  }
  if (data.permission_id !== undefined) {
    sets.push("permission_id = ?");
    values.push(data.permission_id);
  }
  if (data.conditions !== undefined) {
    sets.push("conditions = ?");
    values.push(data.conditions);
  }
  if (data.granted_at !== undefined) {
    sets.push("granted_at = ?");
    values.push(data.granted_at);
  }

  values.push(id);
  const sql = `UPDATE role_permissions SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class RolePermissionsRepository {
  constructor(private db: Database) {}

  findById(id: string): RolePermissions | null {
    return this.db.query<RolePermissions, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): RolePermissions[] {
    return this.db.query<RolePermissions, []>(buildSelectAll(options)).all();
  }

  create(data: RolePermissionsInsert): RolePermissions {
    const { sql, params } = buildInsert(data);
    return this.db.query<RolePermissions, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: RolePermissionsUpdate): RolePermissions | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<RolePermissions, unknown[]>(sql).get(...params) ?? null;
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