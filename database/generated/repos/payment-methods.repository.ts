/**
 * Repository for payment_methods
 * Source: 22_commercial_layer.sql
 */

import { Database } from "bun:sqlite";
import type { PaymentMethods, PaymentMethodsInsert, PaymentMethodsUpdate } from "../types/payment-methods";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "payment_methods";

const SELECT_BY_ID = "SELECT * FROM payment_methods WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM payment_methods WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM payment_methods WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM payment_methods`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: PaymentMethodsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.external_id !== undefined) {
    columns.push("external_id");
    values.push(data.external_id);
    placeholders.push("?");
  }
  if (data.type !== undefined) {
    columns.push("type");
    values.push(data.type);
    placeholders.push("?");
  }
  if (data.provider !== undefined) {
    columns.push("provider");
    values.push(data.provider);
    placeholders.push("?");
  }
  if (data.is_default !== undefined) {
    columns.push("is_default");
    values.push(data.is_default);
    placeholders.push("?");
  }
  if (data.last_four !== undefined) {
    columns.push("last_four");
    values.push(data.last_four);
    placeholders.push("?");
  }
  if (data.brand !== undefined) {
    columns.push("brand");
    values.push(data.brand);
    placeholders.push("?");
  }
  if (data.exp_month !== undefined) {
    columns.push("exp_month");
    values.push(data.exp_month);
    placeholders.push("?");
  }
  if (data.exp_year !== undefined) {
    columns.push("exp_year");
    values.push(data.exp_year);
    placeholders.push("?");
  }
  if (data.billing_address !== undefined) {
    columns.push("billing_address");
    values.push(data.billing_address);
    placeholders.push("?");
  }

  const sql = `INSERT INTO payment_methods (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: PaymentMethodsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.external_id !== undefined) {
    sets.push("external_id = ?");
    values.push(data.external_id);
  }
  if (data.type !== undefined) {
    sets.push("type = ?");
    values.push(data.type);
  }
  if (data.provider !== undefined) {
    sets.push("provider = ?");
    values.push(data.provider);
  }
  if (data.is_default !== undefined) {
    sets.push("is_default = ?");
    values.push(data.is_default);
  }
  if (data.last_four !== undefined) {
    sets.push("last_four = ?");
    values.push(data.last_four);
  }
  if (data.brand !== undefined) {
    sets.push("brand = ?");
    values.push(data.brand);
  }
  if (data.exp_month !== undefined) {
    sets.push("exp_month = ?");
    values.push(data.exp_month);
  }
  if (data.exp_year !== undefined) {
    sets.push("exp_year = ?");
    values.push(data.exp_year);
  }
  if (data.billing_address !== undefined) {
    sets.push("billing_address = ?");
    values.push(data.billing_address);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE payment_methods SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class PaymentMethodsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): PaymentMethods | null {
    return this.db.query<PaymentMethods, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): PaymentMethods[] {
    return this.db.query<PaymentMethods, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: PaymentMethodsInsert): PaymentMethods {
    const { sql, params } = buildInsert(data);
    return this.db.query<PaymentMethods, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: PaymentMethodsUpdate, tenantId: string): PaymentMethods | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<PaymentMethods, unknown[]>(sql).get(...params) ?? null;
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