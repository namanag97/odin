/**
 * Repository for data_job_tasks
 * Source: 15_data_model.sql
 */

import { Database } from "bun:sqlite";
import type { DataJobTasks, DataJobTasksInsert, DataJobTasksUpdate } from "../types/data-job-tasks";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "data_job_tasks";

const SELECT_BY_ID = "SELECT * FROM data_job_tasks WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM data_job_tasks WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM data_job_tasks WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM data_job_tasks`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: DataJobTasksInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.data_job_id !== undefined) {
    columns.push("data_job_id");
    values.push(data.data_job_id);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.task_type !== undefined) {
    columns.push("task_type");
    values.push(data.task_type);
    placeholders.push("?");
  }
  if (data.execution_order !== undefined) {
    columns.push("execution_order");
    values.push(data.execution_order);
    placeholders.push("?");
  }
  if (data.source_connection_id !== undefined) {
    columns.push("source_connection_id");
    values.push(data.source_connection_id);
    placeholders.push("?");
  }
  if (data.source_query !== undefined) {
    columns.push("source_query");
    values.push(data.source_query);
    placeholders.push("?");
  }
  if (data.target_table_id !== undefined) {
    columns.push("target_table_id");
    values.push(data.target_table_id);
    placeholders.push("?");
  }
  if (data.transformation_sql !== undefined) {
    columns.push("transformation_sql");
    values.push(data.transformation_sql);
    placeholders.push("?");
  }
  if (data.extraction_mode !== undefined) {
    columns.push("extraction_mode");
    values.push(data.extraction_mode);
    placeholders.push("?");
  }
  if (data.delta_column !== undefined) {
    columns.push("delta_column");
    values.push(data.delta_column);
    placeholders.push("?");
  }
  if (data.delta_value !== undefined) {
    columns.push("delta_value");
    values.push(data.delta_value);
    placeholders.push("?");
  }
  if (data.is_enabled !== undefined) {
    columns.push("is_enabled");
    values.push(data.is_enabled);
    placeholders.push("?");
  }
  if (data.timeout_seconds !== undefined) {
    columns.push("timeout_seconds");
    values.push(data.timeout_seconds);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO data_job_tasks (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: DataJobTasksUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.data_job_id !== undefined) {
    sets.push("data_job_id = ?");
    values.push(data.data_job_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.task_type !== undefined) {
    sets.push("task_type = ?");
    values.push(data.task_type);
  }
  if (data.execution_order !== undefined) {
    sets.push("execution_order = ?");
    values.push(data.execution_order);
  }
  if (data.source_connection_id !== undefined) {
    sets.push("source_connection_id = ?");
    values.push(data.source_connection_id);
  }
  if (data.source_query !== undefined) {
    sets.push("source_query = ?");
    values.push(data.source_query);
  }
  if (data.target_table_id !== undefined) {
    sets.push("target_table_id = ?");
    values.push(data.target_table_id);
  }
  if (data.transformation_sql !== undefined) {
    sets.push("transformation_sql = ?");
    values.push(data.transformation_sql);
  }
  if (data.extraction_mode !== undefined) {
    sets.push("extraction_mode = ?");
    values.push(data.extraction_mode);
  }
  if (data.delta_column !== undefined) {
    sets.push("delta_column = ?");
    values.push(data.delta_column);
  }
  if (data.delta_value !== undefined) {
    sets.push("delta_value = ?");
    values.push(data.delta_value);
  }
  if (data.is_enabled !== undefined) {
    sets.push("is_enabled = ?");
    values.push(data.is_enabled);
  }
  if (data.timeout_seconds !== undefined) {
    sets.push("timeout_seconds = ?");
    values.push(data.timeout_seconds);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE data_job_tasks SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class DataJobTasksRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): DataJobTasks | null {
    return this.db.query<DataJobTasks, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): DataJobTasks[] {
    return this.db.query<DataJobTasks, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: DataJobTasksInsert): DataJobTasks {
    const { sql, params } = buildInsert(data);
    return this.db.query<DataJobTasks, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: DataJobTasksUpdate, tenantId: string): DataJobTasks | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<DataJobTasks, unknown[]>(sql).get(...params) ?? null;
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