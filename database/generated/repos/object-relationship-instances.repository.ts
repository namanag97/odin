/**
 * Repository for object_relationship_instances
 * Source: 19_ocpm_extended.sql
 */

import { Database } from "bun:sqlite";
import type { ObjectRelationshipInstances, ObjectRelationshipInstancesInsert, ObjectRelationshipInstancesUpdate } from "../types/object-relationship-instances";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "object_relationship_instances";

const SELECT_BY_ID = "SELECT * FROM object_relationship_instances WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM object_relationship_instances WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM object_relationship_instances WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM object_relationship_instances`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ObjectRelationshipInstancesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.relationship_id !== undefined) {
    columns.push("relationship_id");
    values.push(data.relationship_id);
    placeholders.push("?");
  }
  if (data.source_object_id !== undefined) {
    columns.push("source_object_id");
    values.push(data.source_object_id);
    placeholders.push("?");
  }
  if (data.target_object_id !== undefined) {
    columns.push("target_object_id");
    values.push(data.target_object_id);
    placeholders.push("?");
  }
  if (data.valid_from !== undefined) {
    columns.push("valid_from");
    values.push(data.valid_from);
    placeholders.push("?");
  }
  if (data.valid_to !== undefined) {
    columns.push("valid_to");
    values.push(data.valid_to);
    placeholders.push("?");
  }
  if (data.attributes !== undefined) {
    columns.push("attributes");
    values.push(JSON.stringify(data.attributes));
    placeholders.push("?");
  }

  const sql = `INSERT INTO object_relationship_instances (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ObjectRelationshipInstancesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.relationship_id !== undefined) {
    sets.push("relationship_id = ?");
    values.push(data.relationship_id);
  }
  if (data.source_object_id !== undefined) {
    sets.push("source_object_id = ?");
    values.push(data.source_object_id);
  }
  if (data.target_object_id !== undefined) {
    sets.push("target_object_id = ?");
    values.push(data.target_object_id);
  }
  if (data.valid_from !== undefined) {
    sets.push("valid_from = ?");
    values.push(data.valid_from);
  }
  if (data.valid_to !== undefined) {
    sets.push("valid_to = ?");
    values.push(data.valid_to);
  }
  if (data.attributes !== undefined) {
    sets.push("attributes = ?");
    values.push(JSON.stringify(data.attributes));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE object_relationship_instances SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ObjectRelationshipInstancesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ObjectRelationshipInstances | null {
    return this.db.query<ObjectRelationshipInstances, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ObjectRelationshipInstances[] {
    return this.db.query<ObjectRelationshipInstances, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ObjectRelationshipInstancesInsert): ObjectRelationshipInstances {
    const { sql, params } = buildInsert(data);
    return this.db.query<ObjectRelationshipInstances, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ObjectRelationshipInstancesUpdate, tenantId: string): ObjectRelationshipInstances | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ObjectRelationshipInstances, unknown[]>(sql).get(...params) ?? null;
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