/**
 * Repository for user_credentials
 * Source: 21_identity_layer.sql
 */

import { Database } from "bun:sqlite";
import type { UserCredentials, UserCredentialsInsert, UserCredentialsUpdate } from "../types/user-credentials";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "user_credentials";

const SELECT_BY_ID = "SELECT * FROM user_credentials WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM user_credentials WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM user_credentials";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM user_credentials`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: UserCredentialsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.user_id !== undefined) {
    columns.push("user_id");
    values.push(data.user_id);
    placeholders.push("?");
  }
  if (data.provider !== undefined) {
    columns.push("provider");
    values.push(data.provider);
    placeholders.push("?");
  }
  if (data.provider_user_id !== undefined) {
    columns.push("provider_user_id");
    values.push(data.provider_user_id);
    placeholders.push("?");
  }
  if (data.access_token_enc !== undefined) {
    columns.push("access_token_enc");
    values.push(data.access_token_enc);
    placeholders.push("?");
  }
  if (data.refresh_token_enc !== undefined) {
    columns.push("refresh_token_enc");
    values.push(data.refresh_token_enc);
    placeholders.push("?");
  }
  if (data.token_expires_at !== undefined) {
    columns.push("token_expires_at");
    values.push(data.token_expires_at);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO user_credentials (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: UserCredentialsUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.user_id !== undefined) {
    sets.push("user_id = ?");
    values.push(data.user_id);
  }
  if (data.provider !== undefined) {
    sets.push("provider = ?");
    values.push(data.provider);
  }
  if (data.provider_user_id !== undefined) {
    sets.push("provider_user_id = ?");
    values.push(data.provider_user_id);
  }
  if (data.access_token_enc !== undefined) {
    sets.push("access_token_enc = ?");
    values.push(data.access_token_enc);
  }
  if (data.refresh_token_enc !== undefined) {
    sets.push("refresh_token_enc = ?");
    values.push(data.refresh_token_enc);
  }
  if (data.token_expires_at !== undefined) {
    sets.push("token_expires_at = ?");
    values.push(data.token_expires_at);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  const sql = `UPDATE user_credentials SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class UserCredentialsRepository {
  constructor(private db: Database) {}

  findById(id: string): UserCredentials | null {
    return this.db.query<UserCredentials, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): UserCredentials[] {
    return this.db.query<UserCredentials, []>(buildSelectAll(options)).all();
  }

  create(data: UserCredentialsInsert): UserCredentials {
    const { sql, params } = buildInsert(data);
    return this.db.query<UserCredentials, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: UserCredentialsUpdate): UserCredentials | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<UserCredentials, unknown[]>(sql).get(...params) ?? null;
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