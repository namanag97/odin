/**
 * Repository for resources
 * Source: 02_case_centric.sql
 */

import { Database } from "bun:sqlite";
import type { Resources, ResourcesInsert, ResourcesUpdate } from "../types/resources";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "resources";

const SELECT_BY_ID = "SELECT * FROM resources WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM resources WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM resources WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM resources`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ResourcesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.event_log_id !== undefined) {
    columns.push("event_log_id");
    values.push(data.event_log_id);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.display_name !== undefined) {
    columns.push("display_name");
    values.push(data.display_name);
    placeholders.push("?");
  }
  if (data.resource_type !== undefined) {
    columns.push("resource_type");
    values.push(data.resource_type);
    placeholders.push("?");
  }
  if (data.department !== undefined) {
    columns.push("department");
    values.push(data.department);
    placeholders.push("?");
  }
  if (data.role !== undefined) {
    columns.push("role");
    values.push(data.role);
    placeholders.push("?");
  }
  if (data.email !== undefined) {
    columns.push("email");
    values.push(data.email);
    placeholders.push("?");
  }
  if (data.event_count !== undefined) {
    columns.push("event_count");
    values.push(data.event_count);
    placeholders.push("?");
  }
  if (data.distinct_activities !== undefined) {
    columns.push("distinct_activities");
    values.push(data.distinct_activities);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO resources (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ResourcesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.event_log_id !== undefined) {
    sets.push("event_log_id = ?");
    values.push(data.event_log_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.display_name !== undefined) {
    sets.push("display_name = ?");
    values.push(data.display_name);
  }
  if (data.resource_type !== undefined) {
    sets.push("resource_type = ?");
    values.push(data.resource_type);
  }
  if (data.department !== undefined) {
    sets.push("department = ?");
    values.push(data.department);
  }
  if (data.role !== undefined) {
    sets.push("role = ?");
    values.push(data.role);
  }
  if (data.email !== undefined) {
    sets.push("email = ?");
    values.push(data.email);
  }
  if (data.event_count !== undefined) {
    sets.push("event_count = ?");
    values.push(data.event_count);
  }
  if (data.distinct_activities !== undefined) {
    sets.push("distinct_activities = ?");
    values.push(data.distinct_activities);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE resources SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ResourcesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Resources | null {
    return this.db.query<Resources, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Resources[] {
    return this.db.query<Resources, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ResourcesInsert): Resources {
    const { sql, params } = buildInsert(data);
    return this.db.query<Resources, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ResourcesUpdate, tenantId: string): Resources | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Resources, unknown[]>(sql).get(...params) ?? null;
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