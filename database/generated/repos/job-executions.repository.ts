/**
 * Repository for job_executions
 * Source: 15_data_model.sql
 */

import { Database } from "bun:sqlite";
import type { JobExecutions, JobExecutionsInsert, JobExecutionsUpdate } from "../types/job-executions";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "job_executions";

const SELECT_BY_ID = "SELECT * FROM job_executions WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM job_executions WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM job_executions WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM job_executions`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: JobExecutionsInsert): { sql: string; params: unknown[] } {
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
  if (data.triggered_by !== undefined) {
    columns.push("triggered_by");
    values.push(data.triggered_by);
    placeholders.push("?");
  }
  if (data.triggered_by_user_id !== undefined) {
    columns.push("triggered_by_user_id");
    values.push(data.triggered_by_user_id);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.started_at !== undefined) {
    columns.push("started_at");
    values.push(data.started_at);
    placeholders.push("?");
  }
  if (data.completed_at !== undefined) {
    columns.push("completed_at");
    values.push(data.completed_at);
    placeholders.push("?");
  }
  if (data.duration_ms !== undefined) {
    columns.push("duration_ms");
    values.push(data.duration_ms);
    placeholders.push("?");
  }
  if (data.rows_processed !== undefined) {
    columns.push("rows_processed");
    values.push(data.rows_processed);
    placeholders.push("?");
  }
  if (data.rows_failed !== undefined) {
    columns.push("rows_failed");
    values.push(data.rows_failed);
    placeholders.push("?");
  }
  if (data.error_message !== undefined) {
    columns.push("error_message");
    values.push(data.error_message);
    placeholders.push("?");
  }
  if (data.error_details !== undefined) {
    columns.push("error_details");
    values.push(JSON.stringify(data.error_details));
    placeholders.push("?");
  }
  if (data.task_results !== undefined) {
    columns.push("task_results");
    values.push(JSON.stringify(data.task_results));
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO job_executions (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: JobExecutionsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.data_job_id !== undefined) {
    sets.push("data_job_id = ?");
    values.push(data.data_job_id);
  }
  if (data.triggered_by !== undefined) {
    sets.push("triggered_by = ?");
    values.push(data.triggered_by);
  }
  if (data.triggered_by_user_id !== undefined) {
    sets.push("triggered_by_user_id = ?");
    values.push(data.triggered_by_user_id);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.started_at !== undefined) {
    sets.push("started_at = ?");
    values.push(data.started_at);
  }
  if (data.completed_at !== undefined) {
    sets.push("completed_at = ?");
    values.push(data.completed_at);
  }
  if (data.duration_ms !== undefined) {
    sets.push("duration_ms = ?");
    values.push(data.duration_ms);
  }
  if (data.rows_processed !== undefined) {
    sets.push("rows_processed = ?");
    values.push(data.rows_processed);
  }
  if (data.rows_failed !== undefined) {
    sets.push("rows_failed = ?");
    values.push(data.rows_failed);
  }
  if (data.error_message !== undefined) {
    sets.push("error_message = ?");
    values.push(data.error_message);
  }
  if (data.error_details !== undefined) {
    sets.push("error_details = ?");
    values.push(JSON.stringify(data.error_details));
  }
  if (data.task_results !== undefined) {
    sets.push("task_results = ?");
    values.push(JSON.stringify(data.task_results));
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE job_executions SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class JobExecutionsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): JobExecutions | null {
    return this.db.query<JobExecutions, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): JobExecutions[] {
    return this.db.query<JobExecutions, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: JobExecutionsInsert): JobExecutions {
    const { sql, params } = buildInsert(data);
    return this.db.query<JobExecutions, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: JobExecutionsUpdate, tenantId: string): JobExecutions | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<JobExecutions, unknown[]>(sql).get(...params) ?? null;
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