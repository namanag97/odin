/**
 * Repository for notifications
 * Source: 26_communication_layer.sql
 */

import { Database } from "bun:sqlite";
import type { Notifications, NotificationsInsert, NotificationsUpdate } from "../types/notifications";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "notifications";

const SELECT_BY_ID = "SELECT * FROM notifications WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM notifications WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM notifications WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM notifications`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: NotificationsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.user_id !== undefined) {
    columns.push("user_id");
    values.push(data.user_id);
    placeholders.push("?");
  }
  if (data.template_id !== undefined) {
    columns.push("template_id");
    values.push(data.template_id);
    placeholders.push("?");
  }
  if (data.channel !== undefined) {
    columns.push("channel");
    values.push(data.channel);
    placeholders.push("?");
  }
  if (data.type !== undefined) {
    columns.push("type");
    values.push(data.type);
    placeholders.push("?");
  }
  if (data.title !== undefined) {
    columns.push("title");
    values.push(data.title);
    placeholders.push("?");
  }
  if (data.body !== undefined) {
    columns.push("body");
    values.push(data.body);
    placeholders.push("?");
  }
  if (data.data !== undefined) {
    columns.push("data");
    values.push(data.data);
    placeholders.push("?");
  }
  if (data.action_url !== undefined) {
    columns.push("action_url");
    values.push(data.action_url);
    placeholders.push("?");
  }
  if (data.priority !== undefined) {
    columns.push("priority");
    values.push(data.priority);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.read_at !== undefined) {
    columns.push("read_at");
    values.push(data.read_at);
    placeholders.push("?");
  }
  if (data.sent_at !== undefined) {
    columns.push("sent_at");
    values.push(data.sent_at);
    placeholders.push("?");
  }
  if (data.error !== undefined) {
    columns.push("error");
    values.push(data.error);
    placeholders.push("?");
  }

  const sql = `INSERT INTO notifications (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: NotificationsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.user_id !== undefined) {
    sets.push("user_id = ?");
    values.push(data.user_id);
  }
  if (data.template_id !== undefined) {
    sets.push("template_id = ?");
    values.push(data.template_id);
  }
  if (data.channel !== undefined) {
    sets.push("channel = ?");
    values.push(data.channel);
  }
  if (data.type !== undefined) {
    sets.push("type = ?");
    values.push(data.type);
  }
  if (data.title !== undefined) {
    sets.push("title = ?");
    values.push(data.title);
  }
  if (data.body !== undefined) {
    sets.push("body = ?");
    values.push(data.body);
  }
  if (data.data !== undefined) {
    sets.push("data = ?");
    values.push(data.data);
  }
  if (data.action_url !== undefined) {
    sets.push("action_url = ?");
    values.push(data.action_url);
  }
  if (data.priority !== undefined) {
    sets.push("priority = ?");
    values.push(data.priority);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.read_at !== undefined) {
    sets.push("read_at = ?");
    values.push(data.read_at);
  }
  if (data.sent_at !== undefined) {
    sets.push("sent_at = ?");
    values.push(data.sent_at);
  }
  if (data.error !== undefined) {
    sets.push("error = ?");
    values.push(data.error);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE notifications SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class NotificationsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Notifications | null {
    return this.db.query<Notifications, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Notifications[] {
    return this.db.query<Notifications, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: NotificationsInsert): Notifications {
    const { sql, params } = buildInsert(data);
    return this.db.query<Notifications, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: NotificationsUpdate, tenantId: string): Notifications | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Notifications, unknown[]>(sql).get(...params) ?? null;
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