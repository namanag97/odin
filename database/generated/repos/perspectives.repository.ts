/**
 * Repository for perspectives
 * Source: 19_ocpm_extended.sql
 */

import { Database } from "bun:sqlite";
import type { Perspectives, PerspectivesInsert, PerspectivesUpdate } from "../types/perspectives";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "perspectives";

const SELECT_BY_ID = "SELECT * FROM perspectives WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM perspectives WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM perspectives WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM perspectives`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: PerspectivesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.data_model_id !== undefined) {
    columns.push("data_model_id");
    values.push(data.data_model_id);
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
  if (data.included_object_types !== undefined) {
    columns.push("included_object_types");
    values.push(JSON.stringify(data.included_object_types));
    placeholders.push("?");
  }
  if (data.included_event_types !== undefined) {
    columns.push("included_event_types");
    values.push(JSON.stringify(data.included_event_types));
    placeholders.push("?");
  }
  if (data.included_relationships !== undefined) {
    columns.push("included_relationships");
    values.push(JSON.stringify(data.included_relationships));
    placeholders.push("?");
  }
  if (data.filter_expression !== undefined) {
    columns.push("filter_expression");
    values.push(data.filter_expression);
    placeholders.push("?");
  }
  if (data.is_default !== undefined) {
    columns.push("is_default");
    values.push(data.is_default);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.created_by !== undefined) {
    columns.push("created_by");
    values.push(data.created_by);
    placeholders.push("?");
  }
  if (data.published_at !== undefined) {
    columns.push("published_at");
    values.push(data.published_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO perspectives (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: PerspectivesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.data_model_id !== undefined) {
    sets.push("data_model_id = ?");
    values.push(data.data_model_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.included_object_types !== undefined) {
    sets.push("included_object_types = ?");
    values.push(JSON.stringify(data.included_object_types));
  }
  if (data.included_event_types !== undefined) {
    sets.push("included_event_types = ?");
    values.push(JSON.stringify(data.included_event_types));
  }
  if (data.included_relationships !== undefined) {
    sets.push("included_relationships = ?");
    values.push(JSON.stringify(data.included_relationships));
  }
  if (data.filter_expression !== undefined) {
    sets.push("filter_expression = ?");
    values.push(data.filter_expression);
  }
  if (data.is_default !== undefined) {
    sets.push("is_default = ?");
    values.push(data.is_default);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.created_by !== undefined) {
    sets.push("created_by = ?");
    values.push(data.created_by);
  }
  if (data.published_at !== undefined) {
    sets.push("published_at = ?");
    values.push(data.published_at);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE perspectives SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class PerspectivesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Perspectives | null {
    return this.db.query<Perspectives, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Perspectives[] {
    return this.db.query<Perspectives, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: PerspectivesInsert): Perspectives {
    const { sql, params } = buildInsert(data);
    return this.db.query<Perspectives, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: PerspectivesUpdate, tenantId: string): Perspectives | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Perspectives, unknown[]>(sql).get(...params) ?? null;
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