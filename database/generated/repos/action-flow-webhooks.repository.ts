/**
 * Repository for action_flow_webhooks
 * Source: 18_automation_enhanced.sql
 */

import { Database } from "bun:sqlite";
import type { ActionFlowWebhooks, ActionFlowWebhooksInsert, ActionFlowWebhooksUpdate } from "../types/action-flow-webhooks";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "action_flow_webhooks";

const SELECT_BY_ID = "SELECT * FROM action_flow_webhooks WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM action_flow_webhooks WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM action_flow_webhooks WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM action_flow_webhooks`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ActionFlowWebhooksInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.action_flow_id !== undefined) {
    columns.push("action_flow_id");
    values.push(data.action_flow_id);
    placeholders.push("?");
  }
  if (data.udid !== undefined) {
    columns.push("udid");
    values.push(data.udid);
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
  if (data.secret !== undefined) {
    columns.push("secret");
    values.push(data.secret);
    placeholders.push("?");
  }
  if (data.connection_id !== undefined) {
    columns.push("connection_id");
    values.push(data.connection_id);
    placeholders.push("?");
  }
  if (data.data_structure !== undefined) {
    columns.push("data_structure");
    values.push(data.data_structure);
    placeholders.push("?");
  }
  if (data.get_request_headers !== undefined) {
    columns.push("get_request_headers");
    values.push(data.get_request_headers);
    placeholders.push("?");
  }
  if (data.get_http_method !== undefined) {
    columns.push("get_http_method");
    values.push(data.get_http_method);
    placeholders.push("?");
  }
  if (data.json_passthrough !== undefined) {
    columns.push("json_passthrough");
    values.push(data.json_passthrough);
    placeholders.push("?");
  }
  if (data.ip_allowlist !== undefined) {
    columns.push("ip_allowlist");
    values.push(JSON.stringify(data.ip_allowlist));
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.queue_size !== undefined) {
    columns.push("queue_size");
    values.push(data.queue_size);
    placeholders.push("?");
  }
  if (data.max_queue_size !== undefined) {
    columns.push("max_queue_size");
    values.push(data.max_queue_size);
    placeholders.push("?");
  }
  if (data.last_called_at !== undefined) {
    columns.push("last_called_at");
    values.push(data.last_called_at);
    placeholders.push("?");
  }
  if (data.expires_at !== undefined) {
    columns.push("expires_at");
    values.push(data.expires_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO action_flow_webhooks (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ActionFlowWebhooksUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.action_flow_id !== undefined) {
    sets.push("action_flow_id = ?");
    values.push(data.action_flow_id);
  }
  if (data.udid !== undefined) {
    sets.push("udid = ?");
    values.push(data.udid);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.url !== undefined) {
    sets.push("url = ?");
    values.push(data.url);
  }
  if (data.secret !== undefined) {
    sets.push("secret = ?");
    values.push(data.secret);
  }
  if (data.connection_id !== undefined) {
    sets.push("connection_id = ?");
    values.push(data.connection_id);
  }
  if (data.data_structure !== undefined) {
    sets.push("data_structure = ?");
    values.push(data.data_structure);
  }
  if (data.get_request_headers !== undefined) {
    sets.push("get_request_headers = ?");
    values.push(data.get_request_headers);
  }
  if (data.get_http_method !== undefined) {
    sets.push("get_http_method = ?");
    values.push(data.get_http_method);
  }
  if (data.json_passthrough !== undefined) {
    sets.push("json_passthrough = ?");
    values.push(data.json_passthrough);
  }
  if (data.ip_allowlist !== undefined) {
    sets.push("ip_allowlist = ?");
    values.push(JSON.stringify(data.ip_allowlist));
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.queue_size !== undefined) {
    sets.push("queue_size = ?");
    values.push(data.queue_size);
  }
  if (data.max_queue_size !== undefined) {
    sets.push("max_queue_size = ?");
    values.push(data.max_queue_size);
  }
  if (data.last_called_at !== undefined) {
    sets.push("last_called_at = ?");
    values.push(data.last_called_at);
  }
  if (data.expires_at !== undefined) {
    sets.push("expires_at = ?");
    values.push(data.expires_at);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE action_flow_webhooks SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ActionFlowWebhooksRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ActionFlowWebhooks | null {
    return this.db.query<ActionFlowWebhooks, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ActionFlowWebhooks[] {
    return this.db.query<ActionFlowWebhooks, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ActionFlowWebhooksInsert): ActionFlowWebhooks {
    const { sql, params } = buildInsert(data);
    return this.db.query<ActionFlowWebhooks, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ActionFlowWebhooksUpdate, tenantId: string): ActionFlowWebhooks | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ActionFlowWebhooks, unknown[]>(sql).get(...params) ?? null;
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