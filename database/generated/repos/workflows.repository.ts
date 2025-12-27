/**
 * Repository for workflows
 * Source: 10_automation.sql
 */

import { Database } from "bun:sqlite";
import type { Workflows, WorkflowsInsert, WorkflowsUpdate } from "../types/workflows";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "workflows";

const SELECT_BY_ID = "SELECT * FROM workflows WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM workflows WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM workflows WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM workflows`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: WorkflowsInsert): { sql: string; params: unknown[] } {
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
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.trigger_type !== undefined) {
    columns.push("trigger_type");
    values.push(data.trigger_type);
    placeholders.push("?");
  }
  if (data.trigger_config !== undefined) {
    columns.push("trigger_config");
    values.push(JSON.stringify(data.trigger_config));
    placeholders.push("?");
  }
  if (data.is_active !== undefined) {
    columns.push("is_active");
    values.push(data.is_active);
    placeholders.push("?");
  }
  if (data.timeout_seconds !== undefined) {
    columns.push("timeout_seconds");
    values.push(data.timeout_seconds);
    placeholders.push("?");
  }

  const sql = `INSERT INTO workflows (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: WorkflowsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.trigger_type !== undefined) {
    sets.push("trigger_type = ?");
    values.push(data.trigger_type);
  }
  if (data.trigger_config !== undefined) {
    sets.push("trigger_config = ?");
    values.push(JSON.stringify(data.trigger_config));
  }
  if (data.is_active !== undefined) {
    sets.push("is_active = ?");
    values.push(data.is_active);
  }
  if (data.timeout_seconds !== undefined) {
    sets.push("timeout_seconds = ?");
    values.push(data.timeout_seconds);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE workflows SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class WorkflowsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Workflows | null {
    return this.db.query<Workflows, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Workflows[] {
    return this.db.query<Workflows, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: WorkflowsInsert): Workflows {
    const { sql, params } = buildInsert(data);
    return this.db.query<Workflows, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: WorkflowsUpdate, tenantId: string): Workflows | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Workflows, unknown[]>(sql).get(...params) ?? null;
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