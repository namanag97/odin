/**
 * Repository for scheduled_jobs
 * Source: 10_automation.sql
 */

import { Database } from "bun:sqlite";
import type { ScheduledJobs, ScheduledJobsInsert, ScheduledJobsUpdate } from "../types/scheduled-jobs";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "scheduled_jobs";

const SELECT_BY_ID = "SELECT * FROM scheduled_jobs WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM scheduled_jobs WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM scheduled_jobs WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM scheduled_jobs`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ScheduledJobsInsert): { sql: string; params: unknown[] } {
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
  if (data.job_type !== undefined) {
    columns.push("job_type");
    values.push(data.job_type);
    placeholders.push("?");
  }
  if (data.target_id !== undefined) {
    columns.push("target_id");
    values.push(data.target_id);
    placeholders.push("?");
  }
  if (data.cron_expression !== undefined) {
    columns.push("cron_expression");
    values.push(data.cron_expression);
    placeholders.push("?");
  }
  if (data.timezone !== undefined) {
    columns.push("timezone");
    values.push(data.timezone);
    placeholders.push("?");
  }
  if (data.is_active !== undefined) {
    columns.push("is_active");
    values.push(data.is_active);
    placeholders.push("?");
  }
  if (data.next_run_at !== undefined) {
    columns.push("next_run_at");
    values.push(data.next_run_at);
    placeholders.push("?");
  }
  if (data.last_run_at !== undefined) {
    columns.push("last_run_at");
    values.push(data.last_run_at);
    placeholders.push("?");
  }
  if (data.last_status !== undefined) {
    columns.push("last_status");
    values.push(data.last_status);
    placeholders.push("?");
  }
  if (data.configuration !== undefined) {
    columns.push("configuration");
    values.push(JSON.stringify(data.configuration));
    placeholders.push("?");
  }

  const sql = `INSERT INTO scheduled_jobs (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ScheduledJobsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.job_type !== undefined) {
    sets.push("job_type = ?");
    values.push(data.job_type);
  }
  if (data.target_id !== undefined) {
    sets.push("target_id = ?");
    values.push(data.target_id);
  }
  if (data.cron_expression !== undefined) {
    sets.push("cron_expression = ?");
    values.push(data.cron_expression);
  }
  if (data.timezone !== undefined) {
    sets.push("timezone = ?");
    values.push(data.timezone);
  }
  if (data.is_active !== undefined) {
    sets.push("is_active = ?");
    values.push(data.is_active);
  }
  if (data.next_run_at !== undefined) {
    sets.push("next_run_at = ?");
    values.push(data.next_run_at);
  }
  if (data.last_run_at !== undefined) {
    sets.push("last_run_at = ?");
    values.push(data.last_run_at);
  }
  if (data.last_status !== undefined) {
    sets.push("last_status = ?");
    values.push(data.last_status);
  }
  if (data.configuration !== undefined) {
    sets.push("configuration = ?");
    values.push(JSON.stringify(data.configuration));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE scheduled_jobs SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ScheduledJobsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ScheduledJobs | null {
    return this.db.query<ScheduledJobs, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ScheduledJobs[] {
    return this.db.query<ScheduledJobs, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ScheduledJobsInsert): ScheduledJobs {
    const { sql, params } = buildInsert(data);
    return this.db.query<ScheduledJobs, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ScheduledJobsUpdate, tenantId: string): ScheduledJobs | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ScheduledJobs, unknown[]>(sql).get(...params) ?? null;
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