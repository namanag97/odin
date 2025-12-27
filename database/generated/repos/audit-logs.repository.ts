/**
 * Repository for audit_logs
 * Source: 24_temporal_layer.sql
 */

import { Database } from "bun:sqlite";
import type { AuditLogs, AuditLogsInsert, AuditLogsUpdate } from "../types/audit-logs";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "audit_logs";

const SELECT_BY_ID = "SELECT * FROM audit_logs WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM audit_logs WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM audit_logs WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM audit_logs`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: AuditLogsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.actor_type !== undefined) {
    columns.push("actor_type");
    values.push(data.actor_type);
    placeholders.push("?");
  }
  if (data.actor_id !== undefined) {
    columns.push("actor_id");
    values.push(data.actor_id);
    placeholders.push("?");
  }
  if (data.actor_email !== undefined) {
    columns.push("actor_email");
    values.push(data.actor_email);
    placeholders.push("?");
  }
  if (data.action !== undefined) {
    columns.push("action");
    values.push(data.action);
    placeholders.push("?");
  }
  if (data.resource_type !== undefined) {
    columns.push("resource_type");
    values.push(data.resource_type);
    placeholders.push("?");
  }
  if (data.resource_id !== undefined) {
    columns.push("resource_id");
    values.push(data.resource_id);
    placeholders.push("?");
  }
  if (data.resource_name !== undefined) {
    columns.push("resource_name");
    values.push(data.resource_name);
    placeholders.push("?");
  }
  if (data.changes !== undefined) {
    columns.push("changes");
    values.push(data.changes);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }
  if (data.ip_address !== undefined) {
    columns.push("ip_address");
    values.push(data.ip_address);
    placeholders.push("?");
  }
  if (data.user_agent !== undefined) {
    columns.push("user_agent");
    values.push(data.user_agent);
    placeholders.push("?");
  }
  if (data.request_id !== undefined) {
    columns.push("request_id");
    values.push(data.request_id);
    placeholders.push("?");
  }

  const sql = `INSERT INTO audit_logs (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: AuditLogsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.actor_type !== undefined) {
    sets.push("actor_type = ?");
    values.push(data.actor_type);
  }
  if (data.actor_id !== undefined) {
    sets.push("actor_id = ?");
    values.push(data.actor_id);
  }
  if (data.actor_email !== undefined) {
    sets.push("actor_email = ?");
    values.push(data.actor_email);
  }
  if (data.action !== undefined) {
    sets.push("action = ?");
    values.push(data.action);
  }
  if (data.resource_type !== undefined) {
    sets.push("resource_type = ?");
    values.push(data.resource_type);
  }
  if (data.resource_id !== undefined) {
    sets.push("resource_id = ?");
    values.push(data.resource_id);
  }
  if (data.resource_name !== undefined) {
    sets.push("resource_name = ?");
    values.push(data.resource_name);
  }
  if (data.changes !== undefined) {
    sets.push("changes = ?");
    values.push(data.changes);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }
  if (data.ip_address !== undefined) {
    sets.push("ip_address = ?");
    values.push(data.ip_address);
  }
  if (data.user_agent !== undefined) {
    sets.push("user_agent = ?");
    values.push(data.user_agent);
  }
  if (data.request_id !== undefined) {
    sets.push("request_id = ?");
    values.push(data.request_id);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE audit_logs SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class AuditLogsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): AuditLogs | null {
    return this.db.query<AuditLogs, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): AuditLogs[] {
    return this.db.query<AuditLogs, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: AuditLogsInsert): AuditLogs {
    const { sql, params } = buildInsert(data);
    return this.db.query<AuditLogs, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: AuditLogsUpdate, tenantId: string): AuditLogs | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<AuditLogs, unknown[]>(sql).get(...params) ?? null;
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