/**
 * Repository for teams
 * Source: 21_identity_layer.sql
 */

import { Database } from "bun:sqlite";
import type { Teams, TeamsInsert, TeamsUpdate } from "../types/teams";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "teams";

const SELECT_BY_ID = "SELECT * FROM teams WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM teams WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM teams WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM teams`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: TeamsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.organization_id !== undefined) {
    columns.push("organization_id");
    values.push(data.organization_id);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.slug !== undefined) {
    columns.push("slug");
    values.push(data.slug);
    placeholders.push("?");
  }
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.visibility !== undefined) {
    columns.push("visibility");
    values.push(data.visibility);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO teams (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: TeamsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.organization_id !== undefined) {
    sets.push("organization_id = ?");
    values.push(data.organization_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.slug !== undefined) {
    sets.push("slug = ?");
    values.push(data.slug);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.visibility !== undefined) {
    sets.push("visibility = ?");
    values.push(data.visibility);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE teams SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class TeamsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Teams | null {
    return this.db.query<Teams, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Teams[] {
    return this.db.query<Teams, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: TeamsInsert): Teams {
    const { sql, params } = buildInsert(data);
    return this.db.query<Teams, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: TeamsUpdate, tenantId: string): Teams | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Teams, unknown[]>(sql).get(...params) ?? null;
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