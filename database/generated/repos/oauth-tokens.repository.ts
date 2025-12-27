/**
 * Repository for oauth_tokens
 * Source: 25_integration_layer.sql
 */

import { Database } from "bun:sqlite";
import type { OauthTokens, OauthTokensInsert, OauthTokensUpdate } from "../types/oauth-tokens";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "oauth_tokens";

const SELECT_BY_ID = "SELECT * FROM oauth_tokens WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM oauth_tokens WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM oauth_tokens";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM oauth_tokens`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: OauthTokensInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.integration_id !== undefined) {
    columns.push("integration_id");
    values.push(data.integration_id);
    placeholders.push("?");
  }
  if (data.user_id !== undefined) {
    columns.push("user_id");
    values.push(data.user_id);
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
  if (data.token_type !== undefined) {
    columns.push("token_type");
    values.push(data.token_type);
    placeholders.push("?");
  }
  if (data.scope !== undefined) {
    columns.push("scope");
    values.push(data.scope);
    placeholders.push("?");
  }
  if (data.expires_at !== undefined) {
    columns.push("expires_at");
    values.push(data.expires_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO oauth_tokens (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: OauthTokensUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.integration_id !== undefined) {
    sets.push("integration_id = ?");
    values.push(data.integration_id);
  }
  if (data.user_id !== undefined) {
    sets.push("user_id = ?");
    values.push(data.user_id);
  }
  if (data.access_token_enc !== undefined) {
    sets.push("access_token_enc = ?");
    values.push(data.access_token_enc);
  }
  if (data.refresh_token_enc !== undefined) {
    sets.push("refresh_token_enc = ?");
    values.push(data.refresh_token_enc);
  }
  if (data.token_type !== undefined) {
    sets.push("token_type = ?");
    values.push(data.token_type);
  }
  if (data.scope !== undefined) {
    sets.push("scope = ?");
    values.push(data.scope);
  }
  if (data.expires_at !== undefined) {
    sets.push("expires_at = ?");
    values.push(data.expires_at);
  }

  values.push(id);
  const sql = `UPDATE oauth_tokens SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class OauthTokensRepository {
  constructor(private db: Database) {}

  findById(id: string): OauthTokens | null {
    return this.db.query<OauthTokens, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): OauthTokens[] {
    return this.db.query<OauthTokens, []>(buildSelectAll(options)).all();
  }

  create(data: OauthTokensInsert): OauthTokens {
    const { sql, params } = buildInsert(data);
    return this.db.query<OauthTokens, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: OauthTokensUpdate): OauthTokens | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<OauthTokens, unknown[]>(sql).get(...params) ?? null;
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