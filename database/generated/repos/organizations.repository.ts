/**
 * Repository for organizations
 * Source: 20_existence_layer.sql
 */

import { Database } from "bun:sqlite";
import type { Organizations, OrganizationsInsert, OrganizationsUpdate } from "../types/organizations";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "organizations";

const SELECT_BY_ID = "SELECT * FROM organizations WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM organizations WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM organizations WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM organizations`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: OrganizationsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.parent_org_id !== undefined) {
    columns.push("parent_org_id");
    values.push(data.parent_org_id);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.code !== undefined) {
    columns.push("code");
    values.push(data.code);
    placeholders.push("?");
  }
  if (data.type !== undefined) {
    columns.push("type");
    values.push(data.type);
    placeholders.push("?");
  }
  if (data.hierarchy_path !== undefined) {
    columns.push("hierarchy_path");
    values.push(data.hierarchy_path);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }
  if (data.is_active !== undefined) {
    columns.push("is_active");
    values.push(data.is_active);
    placeholders.push("?");
  }

  const sql = `INSERT INTO organizations (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: OrganizationsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.parent_org_id !== undefined) {
    sets.push("parent_org_id = ?");
    values.push(data.parent_org_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.code !== undefined) {
    sets.push("code = ?");
    values.push(data.code);
  }
  if (data.type !== undefined) {
    sets.push("type = ?");
    values.push(data.type);
  }
  if (data.hierarchy_path !== undefined) {
    sets.push("hierarchy_path = ?");
    values.push(data.hierarchy_path);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }
  if (data.is_active !== undefined) {
    sets.push("is_active = ?");
    values.push(data.is_active);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE organizations SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class OrganizationsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Organizations | null {
    return this.db.query<Organizations, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Organizations[] {
    return this.db.query<Organizations, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: OrganizationsInsert): Organizations {
    const { sql, params } = buildInsert(data);
    return this.db.query<Organizations, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: OrganizationsUpdate, tenantId: string): Organizations | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Organizations, unknown[]>(sql).get(...params) ?? null;
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