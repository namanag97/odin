/**
 * Repository for sessions
 * Source: 21_identity_layer.sql
 */

import { Database } from "bun:sqlite";
import type { Sessions, SessionsInsert, SessionsUpdate } from "../types/sessions";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "sessions";

const SELECT_BY_ID = "SELECT * FROM sessions WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM sessions WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM sessions";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM sessions`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: SessionsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.user_id !== undefined) {
    columns.push("user_id");
    values.push(data.user_id);
    placeholders.push("?");
  }
  if (data.token_hash !== undefined) {
    columns.push("token_hash");
    values.push(data.token_hash);
    placeholders.push("?");
  }
  if (data.ip_address !== undefined) {
    columns.push("ip_address");
    values.push(data.ip_address);
    placeholders.push("?");
  }
  if (data.user_agent !== undefined) {
    columns.push("user_agent");
    values.push(data.user_agent);
    placeholders.push("?");
  }
  if (data.device_fingerprint !== undefined) {
    columns.push("device_fingerprint");
    values.push(data.device_fingerprint);
    placeholders.push("?");
  }
  if (data.location !== undefined) {
    columns.push("location");
    values.push(data.location);
    placeholders.push("?");
  }
  if (data.expires_at !== undefined) {
    columns.push("expires_at");
    values.push(data.expires_at);
    placeholders.push("?");
  }
  if (data.last_active_at !== undefined) {
    columns.push("last_active_at");
    values.push(data.last_active_at);
    placeholders.push("?");
  }
  if (data.revoked_at !== undefined) {
    columns.push("revoked_at");
    values.push(data.revoked_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO sessions (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: SessionsUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.user_id !== undefined) {
    sets.push("user_id = ?");
    values.push(data.user_id);
  }
  if (data.token_hash !== undefined) {
    sets.push("token_hash = ?");
    values.push(data.token_hash);
  }
  if (data.ip_address !== undefined) {
    sets.push("ip_address = ?");
    values.push(data.ip_address);
  }
  if (data.user_agent !== undefined) {
    sets.push("user_agent = ?");
    values.push(data.user_agent);
  }
  if (data.device_fingerprint !== undefined) {
    sets.push("device_fingerprint = ?");
    values.push(data.device_fingerprint);
  }
  if (data.location !== undefined) {
    sets.push("location = ?");
    values.push(data.location);
  }
  if (data.expires_at !== undefined) {
    sets.push("expires_at = ?");
    values.push(data.expires_at);
  }
  if (data.last_active_at !== undefined) {
    sets.push("last_active_at = ?");
    values.push(data.last_active_at);
  }
  if (data.revoked_at !== undefined) {
    sets.push("revoked_at = ?");
    values.push(data.revoked_at);
  }

  values.push(id);
  const sql = `UPDATE sessions SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class SessionsRepository {
  constructor(private db: Database) {}

  findById(id: string): Sessions | null {
    return this.db.query<Sessions, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): Sessions[] {
    return this.db.query<Sessions, []>(buildSelectAll(options)).all();
  }

  create(data: SessionsInsert): Sessions {
    const { sql, params } = buildInsert(data);
    return this.db.query<Sessions, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: SessionsUpdate): Sessions | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<Sessions, unknown[]>(sql).get(...params) ?? null;
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