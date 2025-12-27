/**
 * Repository for data_retention_policies
 * Source: 24_temporal_layer.sql
 */

import { Database } from "bun:sqlite";
import type { DataRetentionPolicies, DataRetentionPoliciesInsert, DataRetentionPoliciesUpdate } from "../types/data-retention-policies";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "data_retention_policies";

const SELECT_BY_ID = "SELECT * FROM data_retention_policies WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM data_retention_policies WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM data_retention_policies WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM data_retention_policies`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: DataRetentionPoliciesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.entity_type !== undefined) {
    columns.push("entity_type");
    values.push(data.entity_type);
    placeholders.push("?");
  }
  if (data.retention_days !== undefined) {
    columns.push("retention_days");
    values.push(data.retention_days);
    placeholders.push("?");
  }
  if (data.archive_after_days !== undefined) {
    columns.push("archive_after_days");
    values.push(data.archive_after_days);
    placeholders.push("?");
  }
  if (data.delete_after_archive_days !== undefined) {
    columns.push("delete_after_archive_days");
    values.push(data.delete_after_archive_days);
    placeholders.push("?");
  }
  if (data.is_active !== undefined) {
    columns.push("is_active");
    values.push(data.is_active);
    placeholders.push("?");
  }
  if (data.last_applied_at !== undefined) {
    columns.push("last_applied_at");
    values.push(data.last_applied_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO data_retention_policies (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: DataRetentionPoliciesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.entity_type !== undefined) {
    sets.push("entity_type = ?");
    values.push(data.entity_type);
  }
  if (data.retention_days !== undefined) {
    sets.push("retention_days = ?");
    values.push(data.retention_days);
  }
  if (data.archive_after_days !== undefined) {
    sets.push("archive_after_days = ?");
    values.push(data.archive_after_days);
  }
  if (data.delete_after_archive_days !== undefined) {
    sets.push("delete_after_archive_days = ?");
    values.push(data.delete_after_archive_days);
  }
  if (data.is_active !== undefined) {
    sets.push("is_active = ?");
    values.push(data.is_active);
  }
  if (data.last_applied_at !== undefined) {
    sets.push("last_applied_at = ?");
    values.push(data.last_applied_at);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE data_retention_policies SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class DataRetentionPoliciesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): DataRetentionPolicies | null {
    return this.db.query<DataRetentionPolicies, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): DataRetentionPolicies[] {
    return this.db.query<DataRetentionPolicies, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: DataRetentionPoliciesInsert): DataRetentionPolicies {
    const { sql, params } = buildInsert(data);
    return this.db.query<DataRetentionPolicies, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: DataRetentionPoliciesUpdate, tenantId: string): DataRetentionPolicies | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<DataRetentionPolicies, unknown[]>(sql).get(...params) ?? null;
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