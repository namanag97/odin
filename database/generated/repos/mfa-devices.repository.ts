/**
 * Repository for mfa_devices
 * Source: 21_identity_layer.sql
 */

import { Database } from "bun:sqlite";
import type { MfaDevices, MfaDevicesInsert, MfaDevicesUpdate } from "../types/mfa-devices";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "mfa_devices";

const SELECT_BY_ID = "SELECT * FROM mfa_devices WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM mfa_devices WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM mfa_devices";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM mfa_devices`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: MfaDevicesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.user_id !== undefined) {
    columns.push("user_id");
    values.push(data.user_id);
    placeholders.push("?");
  }
  if (data.type !== undefined) {
    columns.push("type");
    values.push(data.type);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.secret_encrypted !== undefined) {
    columns.push("secret_encrypted");
    values.push(data.secret_encrypted);
    placeholders.push("?");
  }
  if (data.is_primary !== undefined) {
    columns.push("is_primary");
    values.push(data.is_primary);
    placeholders.push("?");
  }
  if (data.is_verified !== undefined) {
    columns.push("is_verified");
    values.push(data.is_verified);
    placeholders.push("?");
  }
  if (data.last_used_at !== undefined) {
    columns.push("last_used_at");
    values.push(data.last_used_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO mfa_devices (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: MfaDevicesUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.user_id !== undefined) {
    sets.push("user_id = ?");
    values.push(data.user_id);
  }
  if (data.type !== undefined) {
    sets.push("type = ?");
    values.push(data.type);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.secret_encrypted !== undefined) {
    sets.push("secret_encrypted = ?");
    values.push(data.secret_encrypted);
  }
  if (data.is_primary !== undefined) {
    sets.push("is_primary = ?");
    values.push(data.is_primary);
  }
  if (data.is_verified !== undefined) {
    sets.push("is_verified = ?");
    values.push(data.is_verified);
  }
  if (data.last_used_at !== undefined) {
    sets.push("last_used_at = ?");
    values.push(data.last_used_at);
  }

  values.push(id);
  const sql = `UPDATE mfa_devices SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class MfaDevicesRepository {
  constructor(private db: Database) {}

  findById(id: string): MfaDevices | null {
    return this.db.query<MfaDevices, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): MfaDevices[] {
    return this.db.query<MfaDevices, []>(buildSelectAll(options)).all();
  }

  create(data: MfaDevicesInsert): MfaDevices {
    const { sql, params } = buildInsert(data);
    return this.db.query<MfaDevices, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: MfaDevicesUpdate): MfaDevices | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<MfaDevices, unknown[]>(sql).get(...params) ?? null;
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