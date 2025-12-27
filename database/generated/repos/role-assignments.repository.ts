/**
 * Repository for role_assignments
 * Source: 21_identity_layer.sql
 */

import { Database } from "bun:sqlite";
import type { RoleAssignments, RoleAssignmentsInsert, RoleAssignmentsUpdate } from "../types/role-assignments";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "role_assignments";

const SELECT_BY_ID = "SELECT * FROM role_assignments WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM role_assignments WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM role_assignments";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM role_assignments`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: RoleAssignmentsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.role_id !== undefined) {
    columns.push("role_id");
    values.push(data.role_id);
    placeholders.push("?");
  }
  if (data.principal_type !== undefined) {
    columns.push("principal_type");
    values.push(data.principal_type);
    placeholders.push("?");
  }
  if (data.principal_id !== undefined) {
    columns.push("principal_id");
    values.push(data.principal_id);
    placeholders.push("?");
  }
  if (data.scope_type !== undefined) {
    columns.push("scope_type");
    values.push(data.scope_type);
    placeholders.push("?");
  }
  if (data.scope_id !== undefined) {
    columns.push("scope_id");
    values.push(data.scope_id);
    placeholders.push("?");
  }
  if (data.granted_by !== undefined) {
    columns.push("granted_by");
    values.push(data.granted_by);
    placeholders.push("?");
  }
  if (data.granted_at !== undefined) {
    columns.push("granted_at");
    values.push(data.granted_at);
    placeholders.push("?");
  }
  if (data.expires_at !== undefined) {
    columns.push("expires_at");
    values.push(data.expires_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO role_assignments (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: RoleAssignmentsUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.role_id !== undefined) {
    sets.push("role_id = ?");
    values.push(data.role_id);
  }
  if (data.principal_type !== undefined) {
    sets.push("principal_type = ?");
    values.push(data.principal_type);
  }
  if (data.principal_id !== undefined) {
    sets.push("principal_id = ?");
    values.push(data.principal_id);
  }
  if (data.scope_type !== undefined) {
    sets.push("scope_type = ?");
    values.push(data.scope_type);
  }
  if (data.scope_id !== undefined) {
    sets.push("scope_id = ?");
    values.push(data.scope_id);
  }
  if (data.granted_by !== undefined) {
    sets.push("granted_by = ?");
    values.push(data.granted_by);
  }
  if (data.granted_at !== undefined) {
    sets.push("granted_at = ?");
    values.push(data.granted_at);
  }
  if (data.expires_at !== undefined) {
    sets.push("expires_at = ?");
    values.push(data.expires_at);
  }

  values.push(id);
  const sql = `UPDATE role_assignments SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class RoleAssignmentsRepository {
  constructor(private db: Database) {}

  findById(id: string): RoleAssignments | null {
    return this.db.query<RoleAssignments, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): RoleAssignments[] {
    return this.db.query<RoleAssignments, []>(buildSelectAll(options)).all();
  }

  create(data: RoleAssignmentsInsert): RoleAssignments {
    const { sql, params } = buildInsert(data);
    return this.db.query<RoleAssignments, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: RoleAssignmentsUpdate): RoleAssignments | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<RoleAssignments, unknown[]>(sql).get(...params) ?? null;
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