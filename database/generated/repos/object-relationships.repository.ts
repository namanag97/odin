/**
 * Repository for object_relationships
 * Source: 19_ocpm_extended.sql
 */

import { Database } from "bun:sqlite";
import type { ObjectRelationships, ObjectRelationshipsInsert, ObjectRelationshipsUpdate } from "../types/object-relationships";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "object_relationships";

const SELECT_BY_ID = "SELECT * FROM object_relationships WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM object_relationships WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM object_relationships WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM object_relationships`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ObjectRelationshipsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.perspective_id !== undefined) {
    columns.push("perspective_id");
    values.push(data.perspective_id);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.source_object_type_id !== undefined) {
    columns.push("source_object_type_id");
    values.push(data.source_object_type_id);
    placeholders.push("?");
  }
  if (data.target_object_type_id !== undefined) {
    columns.push("target_object_type_id");
    values.push(data.target_object_type_id);
    placeholders.push("?");
  }
  if (data.cardinality !== undefined) {
    columns.push("cardinality");
    values.push(data.cardinality);
    placeholders.push("?");
  }
  if (data.join_columns !== undefined) {
    columns.push("join_columns");
    values.push(data.join_columns);
    placeholders.push("?");
  }
  if (data.is_embedded !== undefined) {
    columns.push("is_embedded");
    values.push(data.is_embedded);
    placeholders.push("?");
  }
  if (data.display_name !== undefined) {
    columns.push("display_name");
    values.push(data.display_name);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO object_relationships (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ObjectRelationshipsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.perspective_id !== undefined) {
    sets.push("perspective_id = ?");
    values.push(data.perspective_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.source_object_type_id !== undefined) {
    sets.push("source_object_type_id = ?");
    values.push(data.source_object_type_id);
  }
  if (data.target_object_type_id !== undefined) {
    sets.push("target_object_type_id = ?");
    values.push(data.target_object_type_id);
  }
  if (data.cardinality !== undefined) {
    sets.push("cardinality = ?");
    values.push(data.cardinality);
  }
  if (data.join_columns !== undefined) {
    sets.push("join_columns = ?");
    values.push(data.join_columns);
  }
  if (data.is_embedded !== undefined) {
    sets.push("is_embedded = ?");
    values.push(data.is_embedded);
  }
  if (data.display_name !== undefined) {
    sets.push("display_name = ?");
    values.push(data.display_name);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE object_relationships SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ObjectRelationshipsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ObjectRelationships | null {
    return this.db.query<ObjectRelationships, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ObjectRelationships[] {
    return this.db.query<ObjectRelationships, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ObjectRelationshipsInsert): ObjectRelationships {
    const { sql, params } = buildInsert(data);
    return this.db.query<ObjectRelationships, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ObjectRelationshipsUpdate, tenantId: string): ObjectRelationships | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ObjectRelationships, unknown[]>(sql).get(...params) ?? null;
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