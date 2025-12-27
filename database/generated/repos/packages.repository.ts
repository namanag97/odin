/**
 * Repository for packages
 * Source: 17_studio.sql
 */

import { Database } from "bun:sqlite";
import type { Packages, PackagesInsert, PackagesUpdate } from "../types/packages";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "packages";

const SELECT_BY_ID = "SELECT * FROM packages WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM packages WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM packages WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM packages`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: PackagesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.space_id !== undefined) {
    columns.push("space_id");
    values.push(data.space_id);
    placeholders.push("?");
  }
  if (data.key !== undefined) {
    columns.push("key");
    values.push(data.key);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.icon !== undefined) {
    columns.push("icon");
    values.push(data.icon);
    placeholders.push("?");
  }
  if (data.color !== undefined) {
    columns.push("color");
    values.push(data.color);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.version !== undefined) {
    columns.push("version");
    values.push(data.version);
    placeholders.push("?");
  }
  if (data.is_template !== undefined) {
    columns.push("is_template");
    values.push(data.is_template);
    placeholders.push("?");
  }
  if (data.source_package_id !== undefined) {
    columns.push("source_package_id");
    values.push(data.source_package_id);
    placeholders.push("?");
  }
  if (data.data_model_variable_id !== undefined) {
    columns.push("data_model_variable_id");
    values.push(data.data_model_variable_id);
    placeholders.push("?");
  }
  if (data.published_at !== undefined) {
    columns.push("published_at");
    values.push(data.published_at);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }
  if (data.created_by !== undefined) {
    columns.push("created_by");
    values.push(data.created_by);
    placeholders.push("?");
  }

  const sql = `INSERT INTO packages (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: PackagesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.space_id !== undefined) {
    sets.push("space_id = ?");
    values.push(data.space_id);
  }
  if (data.key !== undefined) {
    sets.push("key = ?");
    values.push(data.key);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.icon !== undefined) {
    sets.push("icon = ?");
    values.push(data.icon);
  }
  if (data.color !== undefined) {
    sets.push("color = ?");
    values.push(data.color);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.version !== undefined) {
    sets.push("version = ?");
    values.push(data.version);
  }
  if (data.is_template !== undefined) {
    sets.push("is_template = ?");
    values.push(data.is_template);
  }
  if (data.source_package_id !== undefined) {
    sets.push("source_package_id = ?");
    values.push(data.source_package_id);
  }
  if (data.data_model_variable_id !== undefined) {
    sets.push("data_model_variable_id = ?");
    values.push(data.data_model_variable_id);
  }
  if (data.published_at !== undefined) {
    sets.push("published_at = ?");
    values.push(data.published_at);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }
  if (data.created_by !== undefined) {
    sets.push("created_by = ?");
    values.push(data.created_by);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE packages SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class PackagesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Packages | null {
    return this.db.query<Packages, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Packages[] {
    return this.db.query<Packages, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: PackagesInsert): Packages {
    const { sql, params } = buildInsert(data);
    return this.db.query<Packages, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: PackagesUpdate, tenantId: string): Packages | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Packages, unknown[]>(sql).get(...params) ?? null;
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