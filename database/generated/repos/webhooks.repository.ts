/**
 * Repository for webhooks
 * Source: 25_integration_layer.sql
 */

import { Database } from "bun:sqlite";
import type { Webhooks, WebhooksInsert, WebhooksUpdate } from "../types/webhooks";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "webhooks";

const SELECT_BY_ID = "SELECT * FROM webhooks WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM webhooks WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM webhooks WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM webhooks`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: WebhooksInsert): { sql: string; params: unknown[] } {
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
  if (data.url !== undefined) {
    columns.push("url");
    values.push(data.url);
    placeholders.push("?");
  }
  if (data.secret_hash !== undefined) {
    columns.push("secret_hash");
    values.push(data.secret_hash);
    placeholders.push("?");
  }
  if (data.events !== undefined) {
    columns.push("events");
    values.push(data.events);
    placeholders.push("?");
  }
  if (data.is_active !== undefined) {
    columns.push("is_active");
    values.push(data.is_active);
    placeholders.push("?");
  }
  if (data.version !== undefined) {
    columns.push("version");
    values.push(data.version);
    placeholders.push("?");
  }
  if (data.headers !== undefined) {
    columns.push("headers");
    values.push(data.headers);
    placeholders.push("?");
  }
  if (data.retry_config !== undefined) {
    columns.push("retry_config");
    values.push(JSON.stringify(data.retry_config));
    placeholders.push("?");
  }
  if (data.last_triggered_at !== undefined) {
    columns.push("last_triggered_at");
    values.push(data.last_triggered_at);
    placeholders.push("?");
  }
  if (data.failure_count !== undefined) {
    columns.push("failure_count");
    values.push(data.failure_count);
    placeholders.push("?");
  }

  const sql = `INSERT INTO webhooks (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: WebhooksUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.url !== undefined) {
    sets.push("url = ?");
    values.push(data.url);
  }
  if (data.secret_hash !== undefined) {
    sets.push("secret_hash = ?");
    values.push(data.secret_hash);
  }
  if (data.events !== undefined) {
    sets.push("events = ?");
    values.push(data.events);
  }
  if (data.is_active !== undefined) {
    sets.push("is_active = ?");
    values.push(data.is_active);
  }
  if (data.version !== undefined) {
    sets.push("version = ?");
    values.push(data.version);
  }
  if (data.headers !== undefined) {
    sets.push("headers = ?");
    values.push(data.headers);
  }
  if (data.retry_config !== undefined) {
    sets.push("retry_config = ?");
    values.push(JSON.stringify(data.retry_config));
  }
  if (data.last_triggered_at !== undefined) {
    sets.push("last_triggered_at = ?");
    values.push(data.last_triggered_at);
  }
  if (data.failure_count !== undefined) {
    sets.push("failure_count = ?");
    values.push(data.failure_count);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE webhooks SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class WebhooksRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Webhooks | null {
    return this.db.query<Webhooks, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Webhooks[] {
    return this.db.query<Webhooks, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: WebhooksInsert): Webhooks {
    const { sql, params } = buildInsert(data);
    return this.db.query<Webhooks, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: WebhooksUpdate, tenantId: string): Webhooks | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Webhooks, unknown[]>(sql).get(...params) ?? null;
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