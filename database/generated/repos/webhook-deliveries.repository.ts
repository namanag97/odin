/**
 * Repository for webhook_deliveries
 * Source: 25_integration_layer.sql
 */

import { Database } from "bun:sqlite";
import type { WebhookDeliveries, WebhookDeliveriesInsert, WebhookDeliveriesUpdate } from "../types/webhook-deliveries";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "webhook_deliveries";

const SELECT_BY_ID = "SELECT * FROM webhook_deliveries WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM webhook_deliveries WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM webhook_deliveries";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM webhook_deliveries`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: WebhookDeliveriesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.webhook_id !== undefined) {
    columns.push("webhook_id");
    values.push(data.webhook_id);
    placeholders.push("?");
  }
  if (data.event_type !== undefined) {
    columns.push("event_type");
    values.push(data.event_type);
    placeholders.push("?");
  }
  if (data.payload !== undefined) {
    columns.push("payload");
    values.push(data.payload);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.attempts !== undefined) {
    columns.push("attempts");
    values.push(data.attempts);
    placeholders.push("?");
  }
  if (data.response_status !== undefined) {
    columns.push("response_status");
    values.push(data.response_status);
    placeholders.push("?");
  }
  if (data.response_body !== undefined) {
    columns.push("response_body");
    values.push(data.response_body);
    placeholders.push("?");
  }
  if (data.error !== undefined) {
    columns.push("error");
    values.push(data.error);
    placeholders.push("?");
  }
  if (data.next_retry_at !== undefined) {
    columns.push("next_retry_at");
    values.push(data.next_retry_at);
    placeholders.push("?");
  }
  if (data.delivered_at !== undefined) {
    columns.push("delivered_at");
    values.push(data.delivered_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO webhook_deliveries (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: WebhookDeliveriesUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.webhook_id !== undefined) {
    sets.push("webhook_id = ?");
    values.push(data.webhook_id);
  }
  if (data.event_type !== undefined) {
    sets.push("event_type = ?");
    values.push(data.event_type);
  }
  if (data.payload !== undefined) {
    sets.push("payload = ?");
    values.push(data.payload);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.attempts !== undefined) {
    sets.push("attempts = ?");
    values.push(data.attempts);
  }
  if (data.response_status !== undefined) {
    sets.push("response_status = ?");
    values.push(data.response_status);
  }
  if (data.response_body !== undefined) {
    sets.push("response_body = ?");
    values.push(data.response_body);
  }
  if (data.error !== undefined) {
    sets.push("error = ?");
    values.push(data.error);
  }
  if (data.next_retry_at !== undefined) {
    sets.push("next_retry_at = ?");
    values.push(data.next_retry_at);
  }
  if (data.delivered_at !== undefined) {
    sets.push("delivered_at = ?");
    values.push(data.delivered_at);
  }

  values.push(id);
  const sql = `UPDATE webhook_deliveries SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class WebhookDeliveriesRepository {
  constructor(private db: Database) {}

  findById(id: string): WebhookDeliveries | null {
    return this.db.query<WebhookDeliveries, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): WebhookDeliveries[] {
    return this.db.query<WebhookDeliveries, []>(buildSelectAll(options)).all();
  }

  create(data: WebhookDeliveriesInsert): WebhookDeliveries {
    const { sql, params } = buildInsert(data);
    return this.db.query<WebhookDeliveries, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: WebhookDeliveriesUpdate): WebhookDeliveries | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<WebhookDeliveries, unknown[]>(sql).get(...params) ?? null;
  }

  delete(id: string): boolean {
    this.db.query(DELETE_BY_ID).run(id);
    return true;
  }

  count(): number {
    const result = this.db.query<{ count: number }, []>(COUNT_SQL).get();
    return result?.count ?? 0;
  }
}