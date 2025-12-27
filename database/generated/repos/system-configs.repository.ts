/**
 * Repository for system_configs
 * Source: 23_operational_layer.sql
 */

import { Database } from "bun:sqlite";
import type { SystemConfigs, SystemConfigsInsert, SystemConfigsUpdate } from "../types/system-configs";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "system_configs";

const SELECT_BY_ID = "SELECT * FROM system_configs WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM system_configs WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM system_configs";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM system_configs`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: SystemConfigsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.key !== undefined) {
    columns.push("key");
    values.push(data.key);
    placeholders.push("?");
  }
  if (data.value !== undefined) {
    columns.push("value");
    values.push(data.value);
    placeholders.push("?");
  }
  if (data.type !== undefined) {
    columns.push("type");
    values.push(data.type);
    placeholders.push("?");
  }
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.is_sensitive !== undefined) {
    columns.push("is_sensitive");
    values.push(data.is_sensitive);
    placeholders.push("?");
  }
  if (data.updated_by !== undefined) {
    columns.push("updated_by");
    values.push(data.updated_by);
    placeholders.push("?");
  }

  const sql = `INSERT INTO system_configs (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: SystemConfigsUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.key !== undefined) {
    sets.push("key = ?");
    values.push(data.key);
  }
  if (data.value !== undefined) {
    sets.push("value = ?");
    values.push(data.value);
  }
  if (data.type !== undefined) {
    sets.push("type = ?");
    values.push(data.type);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.is_sensitive !== undefined) {
    sets.push("is_sensitive = ?");
    values.push(data.is_sensitive);
  }
  if (data.updated_by !== undefined) {
    sets.push("updated_by = ?");
    values.push(data.updated_by);
  }

  values.push(id);
  const sql = `UPDATE system_configs SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class SystemConfigsRepository {
  constructor(private db: Database) {}

  findById(id: string): SystemConfigs | null {
    return this.db.query<SystemConfigs, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): SystemConfigs[] {
    return this.db.query<SystemConfigs, []>(buildSelectAll(options)).all();
  }

  create(data: SystemConfigsInsert): SystemConfigs {
    const { sql, params } = buildInsert(data);
    return this.db.query<SystemConfigs, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: SystemConfigsUpdate): SystemConfigs | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<SystemConfigs, unknown[]>(sql).get(...params) ?? null;
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