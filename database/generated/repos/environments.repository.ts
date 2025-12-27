/**
 * Repository for environments
 * Source: 20_existence_layer.sql
 */

import { Database } from "bun:sqlite";
import type { Environments, EnvironmentsInsert, EnvironmentsUpdate } from "../types/environments";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "environments";

const SELECT_BY_ID = "SELECT * FROM environments WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM environments WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM environments WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM environments`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: EnvironmentsInsert): { sql: string; params: unknown[] } {
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
  if (data.type !== undefined) {
    columns.push("type");
    values.push(data.type);
    placeholders.push("?");
  }
  if (data.is_default !== undefined) {
    columns.push("is_default");
    values.push(data.is_default);
    placeholders.push("?");
  }
  if (data.config !== undefined) {
    columns.push("config");
    values.push(JSON.stringify(data.config));
    placeholders.push("?");
  }

  const sql = `INSERT INTO environments (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: EnvironmentsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.type !== undefined) {
    sets.push("type = ?");
    values.push(data.type);
  }
  if (data.is_default !== undefined) {
    sets.push("is_default = ?");
    values.push(data.is_default);
  }
  if (data.config !== undefined) {
    sets.push("config = ?");
    values.push(JSON.stringify(data.config));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE environments SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class EnvironmentsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Environments | null {
    return this.db.query<Environments, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Environments[] {
    return this.db.query<Environments, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: EnvironmentsInsert): Environments {
    const { sql, params } = buildInsert(data);
    return this.db.query<Environments, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: EnvironmentsUpdate, tenantId: string): Environments | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Environments, unknown[]>(sql).get(...params) ?? null;
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