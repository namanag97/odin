/**
 * Repository for import_jobs
 * Source: 01_core.sql
 */

import { Database } from "bun:sqlite";
import type { ImportJobs, ImportJobsInsert, ImportJobsUpdate } from "../types/import-jobs";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "import_jobs";

const SELECT_BY_ID = "SELECT * FROM import_jobs WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM import_jobs WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM import_jobs WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM import_jobs`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ImportJobsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.data_pool_id !== undefined) {
    columns.push("data_pool_id");
    values.push(data.data_pool_id);
    placeholders.push("?");
  }
  if (data.connection_id !== undefined) {
    columns.push("connection_id");
    values.push(data.connection_id);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.job_type !== undefined) {
    columns.push("job_type");
    values.push(data.job_type);
    placeholders.push("?");
  }
  if (data.source_query !== undefined) {
    columns.push("source_query");
    values.push(data.source_query);
    placeholders.push("?");
  }
  if (data.mapping_config !== undefined) {
    columns.push("mapping_config");
    values.push(JSON.stringify(data.mapping_config));
    placeholders.push("?");
  }
  if (data.schedule_cron !== undefined) {
    columns.push("schedule_cron");
    values.push(data.schedule_cron);
    placeholders.push("?");
  }
  if (data.is_active !== undefined) {
    columns.push("is_active");
    values.push(data.is_active);
    placeholders.push("?");
  }

  const sql = `INSERT INTO import_jobs (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ImportJobsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.data_pool_id !== undefined) {
    sets.push("data_pool_id = ?");
    values.push(data.data_pool_id);
  }
  if (data.connection_id !== undefined) {
    sets.push("connection_id = ?");
    values.push(data.connection_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.job_type !== undefined) {
    sets.push("job_type = ?");
    values.push(data.job_type);
  }
  if (data.source_query !== undefined) {
    sets.push("source_query = ?");
    values.push(data.source_query);
  }
  if (data.mapping_config !== undefined) {
    sets.push("mapping_config = ?");
    values.push(JSON.stringify(data.mapping_config));
  }
  if (data.schedule_cron !== undefined) {
    sets.push("schedule_cron = ?");
    values.push(data.schedule_cron);
  }
  if (data.is_active !== undefined) {
    sets.push("is_active = ?");
    values.push(data.is_active);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE import_jobs SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ImportJobsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ImportJobs | null {
    return this.db.query<ImportJobs, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ImportJobs[] {
    return this.db.query<ImportJobs, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ImportJobsInsert): ImportJobs {
    const { sql, params } = buildInsert(data);
    return this.db.query<ImportJobs, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ImportJobsUpdate, tenantId: string): ImportJobs | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ImportJobs, unknown[]>(sql).get(...params) ?? null;
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