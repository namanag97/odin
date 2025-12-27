/**
 * Repository for users
 * Source: 21_identity_layer.sql
 */

import { Database } from "bun:sqlite";
import type { Users, UsersInsert, UsersUpdate } from "../types/users";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "users";

const SELECT_BY_ID = "SELECT * FROM users WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM users WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM users WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM users`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: UsersInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.external_id !== undefined) {
    columns.push("external_id");
    values.push(data.external_id);
    placeholders.push("?");
  }
  if (data.email !== undefined) {
    columns.push("email");
    values.push(data.email);
    placeholders.push("?");
  }
  if (data.email_verified_at !== undefined) {
    columns.push("email_verified_at");
    values.push(data.email_verified_at);
    placeholders.push("?");
  }
  if (data.phone !== undefined) {
    columns.push("phone");
    values.push(data.phone);
    placeholders.push("?");
  }
  if (data.phone_verified_at !== undefined) {
    columns.push("phone_verified_at");
    values.push(data.phone_verified_at);
    placeholders.push("?");
  }
  if (data.password_hash !== undefined) {
    columns.push("password_hash");
    values.push(data.password_hash);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.type !== undefined) {
    columns.push("type");
    values.push(data.type);
    placeholders.push("?");
  }
  if (data.last_login_at !== undefined) {
    columns.push("last_login_at");
    values.push(data.last_login_at);
    placeholders.push("?");
  }
  if (data.failed_login_attempts !== undefined) {
    columns.push("failed_login_attempts");
    values.push(data.failed_login_attempts);
    placeholders.push("?");
  }
  if (data.locked_until !== undefined) {
    columns.push("locked_until");
    values.push(data.locked_until);
    placeholders.push("?");
  }
  if (data.mfa_enabled !== undefined) {
    columns.push("mfa_enabled");
    values.push(data.mfa_enabled);
    placeholders.push("?");
  }
  if (data.deleted_at !== undefined) {
    columns.push("deleted_at");
    values.push(data.deleted_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO users (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: UsersUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.external_id !== undefined) {
    sets.push("external_id = ?");
    values.push(data.external_id);
  }
  if (data.email !== undefined) {
    sets.push("email = ?");
    values.push(data.email);
  }
  if (data.email_verified_at !== undefined) {
    sets.push("email_verified_at = ?");
    values.push(data.email_verified_at);
  }
  if (data.phone !== undefined) {
    sets.push("phone = ?");
    values.push(data.phone);
  }
  if (data.phone_verified_at !== undefined) {
    sets.push("phone_verified_at = ?");
    values.push(data.phone_verified_at);
  }
  if (data.password_hash !== undefined) {
    sets.push("password_hash = ?");
    values.push(data.password_hash);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.type !== undefined) {
    sets.push("type = ?");
    values.push(data.type);
  }
  if (data.last_login_at !== undefined) {
    sets.push("last_login_at = ?");
    values.push(data.last_login_at);
  }
  if (data.failed_login_attempts !== undefined) {
    sets.push("failed_login_attempts = ?");
    values.push(data.failed_login_attempts);
  }
  if (data.locked_until !== undefined) {
    sets.push("locked_until = ?");
    values.push(data.locked_until);
  }
  if (data.mfa_enabled !== undefined) {
    sets.push("mfa_enabled = ?");
    values.push(data.mfa_enabled);
  }
  if (data.deleted_at !== undefined) {
    sets.push("deleted_at = ?");
    values.push(data.deleted_at);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE users SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class UsersRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Users | null {
    return this.db.query<Users, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Users[] {
    return this.db.query<Users, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: UsersInsert): Users {
    const { sql, params } = buildInsert(data);
    return this.db.query<Users, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: UsersUpdate, tenantId: string): Users | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Users, unknown[]>(sql).get(...params) ?? null;
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