/**
 * Repository for task_types
 * Source: 18_automation_enhanced.sql
 */

import { Database } from "bun:sqlite";
import type { TaskTypes, TaskTypesInsert, TaskTypesUpdate } from "../types/task-types";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "task_types";

const SELECT_BY_ID = "SELECT * FROM task_types WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM task_types WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM task_types WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM task_types`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: TaskTypesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
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
  if (data.default_priority !== undefined) {
    columns.push("default_priority");
    values.push(data.default_priority);
    placeholders.push("?");
  }
  if (data.attribute_schema !== undefined) {
    columns.push("attribute_schema");
    values.push(JSON.stringify(data.attribute_schema));
    placeholders.push("?");
  }
  if (data.workflow_config !== undefined) {
    columns.push("workflow_config");
    values.push(JSON.stringify(data.workflow_config));
    placeholders.push("?");
  }
  if (data.sla_config !== undefined) {
    columns.push("sla_config");
    values.push(JSON.stringify(data.sla_config));
    placeholders.push("?");
  }
  if (data.is_system !== undefined) {
    columns.push("is_system");
    values.push(data.is_system);
    placeholders.push("?");
  }

  const sql = `INSERT INTO task_types (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: TaskTypesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

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
  if (data.default_priority !== undefined) {
    sets.push("default_priority = ?");
    values.push(data.default_priority);
  }
  if (data.attribute_schema !== undefined) {
    sets.push("attribute_schema = ?");
    values.push(JSON.stringify(data.attribute_schema));
  }
  if (data.workflow_config !== undefined) {
    sets.push("workflow_config = ?");
    values.push(JSON.stringify(data.workflow_config));
  }
  if (data.sla_config !== undefined) {
    sets.push("sla_config = ?");
    values.push(JSON.stringify(data.sla_config));
  }
  if (data.is_system !== undefined) {
    sets.push("is_system = ?");
    values.push(data.is_system);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE task_types SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class TaskTypesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): TaskTypes | null {
    return this.db.query<TaskTypes, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): TaskTypes[] {
    return this.db.query<TaskTypes, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: TaskTypesInsert): TaskTypes {
    const { sql, params } = buildInsert(data);
    return this.db.query<TaskTypes, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: TaskTypesUpdate, tenantId: string): TaskTypes | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<TaskTypes, unknown[]>(sql).get(...params) ?? null;
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