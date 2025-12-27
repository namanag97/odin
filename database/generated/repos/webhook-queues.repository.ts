/**
 * Repository for webhook_queues
 * Source: 18_automation_enhanced.sql
 */

import { Database } from "bun:sqlite";
import type { WebhookQueues, WebhookQueuesInsert, WebhookQueuesUpdate } from "../types/webhook-queues";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "webhook_queues";

const SELECT_BY_ID = "SELECT * FROM webhook_queues WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM webhook_queues WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM webhook_queues WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM webhook_queues`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: WebhookQueuesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.webhook_id !== undefined) {
    columns.push("webhook_id");
    values.push(data.webhook_id);
    placeholders.push("?");
  }
  if (data.payload !== undefined) {
    columns.push("payload");
    values.push(data.payload);
    placeholders.push("?");
  }
  if (data.headers !== undefined) {
    columns.push("headers");
    values.push(JSON.stringify(data.headers));
    placeholders.push("?");
  }
  if (data.http_method !== undefined) {
    columns.push("http_method");
    values.push(data.http_method);
    placeholders.push("?");
  }
  if (data.source_ip !== undefined) {
    columns.push("source_ip");
    values.push(data.source_ip);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.processed_at !== undefined) {
    columns.push("processed_at");
    values.push(data.processed_at);
    placeholders.push("?");
  }
  if (data.error_message !== undefined) {
    columns.push("error_message");
    values.push(data.error_message);
    placeholders.push("?");
  }
  if (data.retry_count !== undefined) {
    columns.push("retry_count");
    values.push(data.retry_count);
    placeholders.push("?");
  }

  const sql = `INSERT INTO webhook_queues (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: WebhookQueuesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.webhook_id !== undefined) {
    sets.push("webhook_id = ?");
    values.push(data.webhook_id);
  }
  if (data.payload !== undefined) {
    sets.push("payload = ?");
    values.push(data.payload);
  }
  if (data.headers !== undefined) {
    sets.push("headers = ?");
    values.push(JSON.stringify(data.headers));
  }
  if (data.http_method !== undefined) {
    sets.push("http_method = ?");
    values.push(data.http_method);
  }
  if (data.source_ip !== undefined) {
    sets.push("source_ip = ?");
    values.push(data.source_ip);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.processed_at !== undefined) {
    sets.push("processed_at = ?");
    values.push(data.processed_at);
  }
  if (data.error_message !== undefined) {
    sets.push("error_message = ?");
    values.push(data.error_message);
  }
  if (data.retry_count !== undefined) {
    sets.push("retry_count = ?");
    values.push(data.retry_count);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE webhook_queues SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class WebhookQueuesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): WebhookQueues | null {
    return this.db.query<WebhookQueues, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): WebhookQueues[] {
    return this.db.query<WebhookQueues, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: WebhookQueuesInsert): WebhookQueues {
    const { sql, params } = buildInsert(data);
    return this.db.query<WebhookQueues, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: WebhookQueuesUpdate, tenantId: string): WebhookQueues | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<WebhookQueues, unknown[]>(sql).get(...params) ?? null;
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