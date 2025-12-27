/**
 * Repository for invoices
 * Source: 22_commercial_layer.sql
 */

import { Database } from "bun:sqlite";
import type { Invoices, InvoicesInsert, InvoicesUpdate } from "../types/invoices";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "invoices";

const SELECT_BY_ID = "SELECT * FROM invoices WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM invoices WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM invoices WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM invoices`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: InvoicesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.subscription_id !== undefined) {
    columns.push("subscription_id");
    values.push(data.subscription_id);
    placeholders.push("?");
  }
  if (data.external_id !== undefined) {
    columns.push("external_id");
    values.push(data.external_id);
    placeholders.push("?");
  }
  if (data.number !== undefined) {
    columns.push("number");
    values.push(data.number);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.currency !== undefined) {
    columns.push("currency");
    values.push(data.currency);
    placeholders.push("?");
  }
  if (data.subtotal !== undefined) {
    columns.push("subtotal");
    values.push(data.subtotal);
    placeholders.push("?");
  }
  if (data.tax !== undefined) {
    columns.push("tax");
    values.push(data.tax);
    placeholders.push("?");
  }
  if (data.total !== undefined) {
    columns.push("total");
    values.push(data.total);
    placeholders.push("?");
  }
  if (data.amount_paid !== undefined) {
    columns.push("amount_paid");
    values.push(data.amount_paid);
    placeholders.push("?");
  }
  if (data.amount_due !== undefined) {
    columns.push("amount_due");
    values.push(data.amount_due);
    placeholders.push("?");
  }
  if (data.period_start !== undefined) {
    columns.push("period_start");
    values.push(data.period_start);
    placeholders.push("?");
  }
  if (data.period_end !== undefined) {
    columns.push("period_end");
    values.push(data.period_end);
    placeholders.push("?");
  }
  if (data.due_date !== undefined) {
    columns.push("due_date");
    values.push(data.due_date);
    placeholders.push("?");
  }
  if (data.paid_at !== undefined) {
    columns.push("paid_at");
    values.push(data.paid_at);
    placeholders.push("?");
  }
  if (data.pdf_url !== undefined) {
    columns.push("pdf_url");
    values.push(data.pdf_url);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO invoices (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: InvoicesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.subscription_id !== undefined) {
    sets.push("subscription_id = ?");
    values.push(data.subscription_id);
  }
  if (data.external_id !== undefined) {
    sets.push("external_id = ?");
    values.push(data.external_id);
  }
  if (data.number !== undefined) {
    sets.push("number = ?");
    values.push(data.number);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.currency !== undefined) {
    sets.push("currency = ?");
    values.push(data.currency);
  }
  if (data.subtotal !== undefined) {
    sets.push("subtotal = ?");
    values.push(data.subtotal);
  }
  if (data.tax !== undefined) {
    sets.push("tax = ?");
    values.push(data.tax);
  }
  if (data.total !== undefined) {
    sets.push("total = ?");
    values.push(data.total);
  }
  if (data.amount_paid !== undefined) {
    sets.push("amount_paid = ?");
    values.push(data.amount_paid);
  }
  if (data.amount_due !== undefined) {
    sets.push("amount_due = ?");
    values.push(data.amount_due);
  }
  if (data.period_start !== undefined) {
    sets.push("period_start = ?");
    values.push(data.period_start);
  }
  if (data.period_end !== undefined) {
    sets.push("period_end = ?");
    values.push(data.period_end);
  }
  if (data.due_date !== undefined) {
    sets.push("due_date = ?");
    values.push(data.due_date);
  }
  if (data.paid_at !== undefined) {
    sets.push("paid_at = ?");
    values.push(data.paid_at);
  }
  if (data.pdf_url !== undefined) {
    sets.push("pdf_url = ?");
    values.push(data.pdf_url);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE invoices SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class InvoicesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Invoices | null {
    return this.db.query<Invoices, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Invoices[] {
    return this.db.query<Invoices, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: InvoicesInsert): Invoices {
    const { sql, params } = buildInsert(data);
    return this.db.query<Invoices, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: InvoicesUpdate, tenantId: string): Invoices | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Invoices, unknown[]>(sql).get(...params) ?? null;
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