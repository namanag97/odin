/**
 * Repository for usage_records
 * Source: 22_commercial_layer.sql
 */

import { Database } from "bun:sqlite";
import type { UsageRecords, UsageRecordsInsert, UsageRecordsUpdate } from "../types/usage-records";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "usage_records";

const SELECT_BY_ID = "SELECT * FROM usage_records WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM usage_records WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM usage_records WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM usage_records`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: UsageRecordsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.subscription_id !== undefined) {
    columns.push("subscription_id");
    values.push(data.subscription_id);
    placeholders.push("?");
  }
  if (data.resource_type !== undefined) {
    columns.push("resource_type");
    values.push(data.resource_type);
    placeholders.push("?");
  }
  if (data.quantity !== undefined) {
    columns.push("quantity");
    values.push(data.quantity);
    placeholders.push("?");
  }
  if (data.unit !== undefined) {
    columns.push("unit");
    values.push(data.unit);
    placeholders.push("?");
  }
  if (data.timestamp !== undefined) {
    columns.push("timestamp");
    values.push(data.timestamp);
    placeholders.push("?");
  }
  if (data.idempotency_key !== undefined) {
    columns.push("idempotency_key");
    values.push(data.idempotency_key);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO usage_records (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: UsageRecordsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.subscription_id !== undefined) {
    sets.push("subscription_id = ?");
    values.push(data.subscription_id);
  }
  if (data.resource_type !== undefined) {
    sets.push("resource_type = ?");
    values.push(data.resource_type);
  }
  if (data.quantity !== undefined) {
    sets.push("quantity = ?");
    values.push(data.quantity);
  }
  if (data.unit !== undefined) {
    sets.push("unit = ?");
    values.push(data.unit);
  }
  if (data.timestamp !== undefined) {
    sets.push("timestamp = ?");
    values.push(data.timestamp);
  }
  if (data.idempotency_key !== undefined) {
    sets.push("idempotency_key = ?");
    values.push(data.idempotency_key);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE usage_records SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class UsageRecordsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): UsageRecords | null {
    return this.db.query<UsageRecords, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): UsageRecords[] {
    return this.db.query<UsageRecords, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: UsageRecordsInsert): UsageRecords {
    const { sql, params } = buildInsert(data);
    return this.db.query<UsageRecords, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: UsageRecordsUpdate, tenantId: string): UsageRecords | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<UsageRecords, unknown[]>(sql).get(...params) ?? null;
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