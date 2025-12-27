/**
 * Repository for conformance_jobs
 * Source: 06_conformance.sql
 */

import { Database } from "bun:sqlite";
import type { ConformanceJobs, ConformanceJobsInsert, ConformanceJobsUpdate } from "../types/conformance-jobs";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "conformance_jobs";

const SELECT_BY_ID = "SELECT * FROM conformance_jobs WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM conformance_jobs WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM conformance_jobs WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM conformance_jobs`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ConformanceJobsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.event_log_id !== undefined) {
    columns.push("event_log_id");
    values.push(data.event_log_id);
    placeholders.push("?");
  }
  if (data.data_pool_id !== undefined) {
    columns.push("data_pool_id");
    values.push(data.data_pool_id);
    placeholders.push("?");
  }
  if (data.model_id !== undefined) {
    columns.push("model_id");
    values.push(data.model_id);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.method !== undefined) {
    columns.push("method");
    values.push(data.method);
    placeholders.push("?");
  }
  if (data.configuration !== undefined) {
    columns.push("configuration");
    values.push(JSON.stringify(data.configuration));
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

  const sql = `INSERT INTO conformance_jobs (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ConformanceJobsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.event_log_id !== undefined) {
    sets.push("event_log_id = ?");
    values.push(data.event_log_id);
  }
  if (data.data_pool_id !== undefined) {
    sets.push("data_pool_id = ?");
    values.push(data.data_pool_id);
  }
  if (data.model_id !== undefined) {
    sets.push("model_id = ?");
    values.push(data.model_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.method !== undefined) {
    sets.push("method = ?");
    values.push(data.method);
  }
  if (data.configuration !== undefined) {
    sets.push("configuration = ?");
    values.push(JSON.stringify(data.configuration));
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
  const sql = `UPDATE conformance_jobs SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ConformanceJobsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ConformanceJobs | null {
    return this.db.query<ConformanceJobs, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ConformanceJobs[] {
    return this.db.query<ConformanceJobs, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ConformanceJobsInsert): ConformanceJobs {
    const { sql, params } = buildInsert(data);
    return this.db.query<ConformanceJobs, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ConformanceJobsUpdate, tenantId: string): ConformanceJobs | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ConformanceJobs, unknown[]>(sql).get(...params) ?? null;
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