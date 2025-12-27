/**
 * Repository for email_messages
 * Source: 26_communication_layer.sql
 */

import { Database } from "bun:sqlite";
import type { EmailMessages, EmailMessagesInsert, EmailMessagesUpdate } from "../types/email-messages";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "email_messages";

const SELECT_BY_ID = "SELECT * FROM email_messages WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM email_messages WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM email_messages WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM email_messages`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: EmailMessagesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.notification_id !== undefined) {
    columns.push("notification_id");
    values.push(data.notification_id);
    placeholders.push("?");
  }
  if (data.from_address !== undefined) {
    columns.push("from_address");
    values.push(data.from_address);
    placeholders.push("?");
  }
  if (data.to_addresses !== undefined) {
    columns.push("to_addresses");
    values.push(data.to_addresses);
    placeholders.push("?");
  }
  if (data.cc_addresses !== undefined) {
    columns.push("cc_addresses");
    values.push(data.cc_addresses);
    placeholders.push("?");
  }
  if (data.bcc_addresses !== undefined) {
    columns.push("bcc_addresses");
    values.push(data.bcc_addresses);
    placeholders.push("?");
  }
  if (data.subject !== undefined) {
    columns.push("subject");
    values.push(data.subject);
    placeholders.push("?");
  }
  if (data.body_text !== undefined) {
    columns.push("body_text");
    values.push(data.body_text);
    placeholders.push("?");
  }
  if (data.body_html !== undefined) {
    columns.push("body_html");
    values.push(data.body_html);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.provider !== undefined) {
    columns.push("provider");
    values.push(data.provider);
    placeholders.push("?");
  }
  if (data.provider_message_id !== undefined) {
    columns.push("provider_message_id");
    values.push(data.provider_message_id);
    placeholders.push("?");
  }
  if (data.opened_at !== undefined) {
    columns.push("opened_at");
    values.push(data.opened_at);
    placeholders.push("?");
  }
  if (data.clicked_at !== undefined) {
    columns.push("clicked_at");
    values.push(data.clicked_at);
    placeholders.push("?");
  }
  if (data.sent_at !== undefined) {
    columns.push("sent_at");
    values.push(data.sent_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO email_messages (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: EmailMessagesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.notification_id !== undefined) {
    sets.push("notification_id = ?");
    values.push(data.notification_id);
  }
  if (data.from_address !== undefined) {
    sets.push("from_address = ?");
    values.push(data.from_address);
  }
  if (data.to_addresses !== undefined) {
    sets.push("to_addresses = ?");
    values.push(data.to_addresses);
  }
  if (data.cc_addresses !== undefined) {
    sets.push("cc_addresses = ?");
    values.push(data.cc_addresses);
  }
  if (data.bcc_addresses !== undefined) {
    sets.push("bcc_addresses = ?");
    values.push(data.bcc_addresses);
  }
  if (data.subject !== undefined) {
    sets.push("subject = ?");
    values.push(data.subject);
  }
  if (data.body_text !== undefined) {
    sets.push("body_text = ?");
    values.push(data.body_text);
  }
  if (data.body_html !== undefined) {
    sets.push("body_html = ?");
    values.push(data.body_html);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.provider !== undefined) {
    sets.push("provider = ?");
    values.push(data.provider);
  }
  if (data.provider_message_id !== undefined) {
    sets.push("provider_message_id = ?");
    values.push(data.provider_message_id);
  }
  if (data.opened_at !== undefined) {
    sets.push("opened_at = ?");
    values.push(data.opened_at);
  }
  if (data.clicked_at !== undefined) {
    sets.push("clicked_at = ?");
    values.push(data.clicked_at);
  }
  if (data.sent_at !== undefined) {
    sets.push("sent_at = ?");
    values.push(data.sent_at);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE email_messages SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class EmailMessagesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): EmailMessages | null {
    return this.db.query<EmailMessages, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): EmailMessages[] {
    return this.db.query<EmailMessages, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: EmailMessagesInsert): EmailMessages {
    const { sql, params } = buildInsert(data);
    return this.db.query<EmailMessages, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: EmailMessagesUpdate, tenantId: string): EmailMessages | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<EmailMessages, unknown[]>(sql).get(...params) ?? null;
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