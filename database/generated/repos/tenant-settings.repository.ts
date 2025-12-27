/**
 * Repository for tenant_settings
 * Source: 23_operational_layer.sql
 */

import { Database } from "bun:sqlite";
import type { TenantSettings, TenantSettingsInsert, TenantSettingsUpdate } from "../types/tenant-settings";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "tenant_settings";

const SELECT_BY_ID = "SELECT * FROM tenant_settings WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM tenant_settings WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM tenant_settings WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM tenant_settings`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: TenantSettingsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.timezone !== undefined) {
    columns.push("timezone");
    values.push(data.timezone);
    placeholders.push("?");
  }
  if (data.date_format !== undefined) {
    columns.push("date_format");
    values.push(data.date_format);
    placeholders.push("?");
  }
  if (data.locale !== undefined) {
    columns.push("locale");
    values.push(data.locale);
    placeholders.push("?");
  }
  if (data.currency !== undefined) {
    columns.push("currency");
    values.push(data.currency);
    placeholders.push("?");
  }
  if (data.branding !== undefined) {
    columns.push("branding");
    values.push(JSON.stringify(data.branding));
    placeholders.push("?");
  }
  if (data.security_settings !== undefined) {
    columns.push("security_settings");
    values.push(JSON.stringify(data.security_settings));
    placeholders.push("?");
  }
  if (data.notification_settings !== undefined) {
    columns.push("notification_settings");
    values.push(JSON.stringify(data.notification_settings));
    placeholders.push("?");
  }
  if (data.feature_flags !== undefined) {
    columns.push("feature_flags");
    values.push(JSON.stringify(data.feature_flags));
    placeholders.push("?");
  }
  if (data.custom_fields_schema !== undefined) {
    columns.push("custom_fields_schema");
    values.push(JSON.stringify(data.custom_fields_schema));
    placeholders.push("?");
  }

  const sql = `INSERT INTO tenant_settings (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: TenantSettingsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.timezone !== undefined) {
    sets.push("timezone = ?");
    values.push(data.timezone);
  }
  if (data.date_format !== undefined) {
    sets.push("date_format = ?");
    values.push(data.date_format);
  }
  if (data.locale !== undefined) {
    sets.push("locale = ?");
    values.push(data.locale);
  }
  if (data.currency !== undefined) {
    sets.push("currency = ?");
    values.push(data.currency);
  }
  if (data.branding !== undefined) {
    sets.push("branding = ?");
    values.push(JSON.stringify(data.branding));
  }
  if (data.security_settings !== undefined) {
    sets.push("security_settings = ?");
    values.push(JSON.stringify(data.security_settings));
  }
  if (data.notification_settings !== undefined) {
    sets.push("notification_settings = ?");
    values.push(JSON.stringify(data.notification_settings));
  }
  if (data.feature_flags !== undefined) {
    sets.push("feature_flags = ?");
    values.push(JSON.stringify(data.feature_flags));
  }
  if (data.custom_fields_schema !== undefined) {
    sets.push("custom_fields_schema = ?");
    values.push(JSON.stringify(data.custom_fields_schema));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE tenant_settings SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class TenantSettingsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): TenantSettings | null {
    return this.db.query<TenantSettings, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): TenantSettings[] {
    return this.db.query<TenantSettings, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: TenantSettingsInsert): TenantSettings {
    const { sql, params } = buildInsert(data);
    return this.db.query<TenantSettings, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: TenantSettingsUpdate, tenantId: string): TenantSettings | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<TenantSettings, unknown[]>(sql).get(...params) ?? null;
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