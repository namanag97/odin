/**
 * Repository for import_job_runs
 * Source: 01_core.sql
 */

import { Database } from "bun:sqlite";
import type { ImportJobRuns, ImportJobRunsInsert, ImportJobRunsUpdate } from "../types/import-job-runs";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "import_job_runs";

const SELECT_BY_ID = "SELECT * FROM import_job_runs WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM import_job_runs WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM import_job_runs WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM import_job_runs`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ImportJobRunsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.job_id !== undefined) {
    columns.push("job_id");
    values.push(data.job_id);
    placeholders.push("?");
  }
  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
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
  if (data.rows_read !== undefined) {
    columns.push("rows_read");
    values.push(data.rows_read);
    placeholders.push("?");
  }
  if (data.rows_written !== undefined) {
    columns.push("rows_written");
    values.push(data.rows_written);
    placeholders.push("?");
  }
  if (data.events_created !== undefined) {
    columns.push("events_created");
    values.push(data.events_created);
    placeholders.push("?");
  }
  if (data.cases_created !== undefined) {
    columns.push("cases_created");
    values.push(data.cases_created);
    placeholders.push("?");
  }
  if (data.objects_created !== undefined) {
    columns.push("objects_created");
    values.push(data.objects_created);
    placeholders.push("?");
  }
  if (data.error_message !== undefined) {
    columns.push("error_message");
    values.push(data.error_message);
    placeholders.push("?");
  }
  if (data.error_details !== undefined) {
    columns.push("error_details");
    values.push(data.error_details);
    placeholders.push("?");
  }
  if (data.metrics !== undefined) {
    columns.push("metrics");
    values.push(JSON.stringify(data.metrics));
    placeholders.push("?");
  }

  const sql = `INSERT INTO import_job_runs (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ImportJobRunsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.job_id !== undefined) {
    sets.push("job_id = ?");
    values.push(data.job_id);
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
  if (data.rows_read !== undefined) {
    sets.push("rows_read = ?");
    values.push(data.rows_read);
  }
  if (data.rows_written !== undefined) {
    sets.push("rows_written = ?");
    values.push(data.rows_written);
  }
  if (data.events_created !== undefined) {
    sets.push("events_created = ?");
    values.push(data.events_created);
  }
  if (data.cases_created !== undefined) {
    sets.push("cases_created = ?");
    values.push(data.cases_created);
  }
  if (data.objects_created !== undefined) {
    sets.push("objects_created = ?");
    values.push(data.objects_created);
  }
  if (data.error_message !== undefined) {
    sets.push("error_message = ?");
    values.push(data.error_message);
  }
  if (data.error_details !== undefined) {
    sets.push("error_details = ?");
    values.push(data.error_details);
  }
  if (data.metrics !== undefined) {
    sets.push("metrics = ?");
    values.push(JSON.stringify(data.metrics));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE import_job_runs SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ImportJobRunsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ImportJobRuns | null {
    return this.db.query<ImportJobRuns, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ImportJobRuns[] {
    return this.db.query<ImportJobRuns, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ImportJobRunsInsert): ImportJobRuns {
    const { sql, params } = buildInsert(data);
    return this.db.query<ImportJobRuns, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ImportJobRunsUpdate, tenantId: string): ImportJobRuns | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ImportJobRuns, unknown[]>(sql).get(...params) ?? null;
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