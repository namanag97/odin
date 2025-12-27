/**
 * Repository for notification_templates
 * Source: 26_communication_layer.sql
 */

import { Database } from "bun:sqlite";
import type { NotificationTemplates, NotificationTemplatesInsert, NotificationTemplatesUpdate } from "../types/notification-templates";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "notification_templates";

const SELECT_BY_ID = "SELECT * FROM notification_templates WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM notification_templates WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM notification_templates WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM notification_templates`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: NotificationTemplatesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.key !== undefined) {
    columns.push("key");
    values.push(data.key);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.channel !== undefined) {
    columns.push("channel");
    values.push(data.channel);
    placeholders.push("?");
  }
  if (data.subject_template !== undefined) {
    columns.push("subject_template");
    values.push(data.subject_template);
    placeholders.push("?");
  }
  if (data.body_template !== undefined) {
    columns.push("body_template");
    values.push(data.body_template);
    placeholders.push("?");
  }
  if (data.body_html_template !== undefined) {
    columns.push("body_html_template");
    values.push(data.body_html_template);
    placeholders.push("?");
  }
  if (data.variables !== undefined) {
    columns.push("variables");
    values.push(JSON.stringify(data.variables));
    placeholders.push("?");
  }
  if (data.locale !== undefined) {
    columns.push("locale");
    values.push(data.locale);
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

  const sql = `INSERT INTO notification_templates (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: NotificationTemplatesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.key !== undefined) {
    sets.push("key = ?");
    values.push(data.key);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.channel !== undefined) {
    sets.push("channel = ?");
    values.push(data.channel);
  }
  if (data.subject_template !== undefined) {
    sets.push("subject_template = ?");
    values.push(data.subject_template);
  }
  if (data.body_template !== undefined) {
    sets.push("body_template = ?");
    values.push(data.body_template);
  }
  if (data.body_html_template !== undefined) {
    sets.push("body_html_template = ?");
    values.push(data.body_html_template);
  }
  if (data.variables !== undefined) {
    sets.push("variables = ?");
    values.push(JSON.stringify(data.variables));
  }
  if (data.locale !== undefined) {
    sets.push("locale = ?");
    values.push(data.locale);
  }
  if (data.is_active !== undefined) {
    sets.push("is_active = ?");
    values.push(data.is_active);
  }
  if (data.version !== undefined) {
    sets.push("version = ?");
    values.push(data.version);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE notification_templates SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class NotificationTemplatesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): NotificationTemplates | null {
    return this.db.query<NotificationTemplates, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): NotificationTemplates[] {
    return this.db.query<NotificationTemplates, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: NotificationTemplatesInsert): NotificationTemplates {
    const { sql, params } = buildInsert(data);
    return this.db.query<NotificationTemplates, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: NotificationTemplatesUpdate, tenantId: string): NotificationTemplates | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<NotificationTemplates, unknown[]>(sql).get(...params) ?? null;
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