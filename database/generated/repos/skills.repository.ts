/**
 * Repository for skills
 * Source: 18_automation_enhanced.sql
 */

import { Database } from "bun:sqlite";
import type { Skills, SkillsInsert, SkillsUpdate } from "../types/skills";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "skills";

const SELECT_BY_ID = "SELECT * FROM skills WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM skills WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM skills WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM skills`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: SkillsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.package_id !== undefined) {
    columns.push("package_id");
    values.push(data.package_id);
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
  if (data.sensor_id !== undefined) {
    columns.push("sensor_id");
    values.push(data.sensor_id);
    placeholders.push("?");
  }
  if (data.action_flow_id !== undefined) {
    columns.push("action_flow_id");
    values.push(data.action_flow_id);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.signal_count !== undefined) {
    columns.push("signal_count");
    values.push(data.signal_count);
    placeholders.push("?");
  }
  if (data.last_evaluated_at !== undefined) {
    columns.push("last_evaluated_at");
    values.push(data.last_evaluated_at);
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

  const sql = `INSERT INTO skills (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: SkillsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.package_id !== undefined) {
    sets.push("package_id = ?");
    values.push(data.package_id);
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
  if (data.sensor_id !== undefined) {
    sets.push("sensor_id = ?");
    values.push(data.sensor_id);
  }
  if (data.action_flow_id !== undefined) {
    sets.push("action_flow_id = ?");
    values.push(data.action_flow_id);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.signal_count !== undefined) {
    sets.push("signal_count = ?");
    values.push(data.signal_count);
  }
  if (data.last_evaluated_at !== undefined) {
    sets.push("last_evaluated_at = ?");
    values.push(data.last_evaluated_at);
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
  const sql = `UPDATE skills SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class SkillsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Skills | null {
    return this.db.query<Skills, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Skills[] {
    return this.db.query<Skills, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: SkillsInsert): Skills {
    const { sql, params } = buildInsert(data);
    return this.db.query<Skills, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: SkillsUpdate, tenantId: string): Skills | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Skills, unknown[]>(sql).get(...params) ?? null;
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