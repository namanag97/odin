/**
 * Repository for invoice_line_items
 * Source: 22_commercial_layer.sql
 */

import { Database } from "bun:sqlite";
import type { InvoiceLineItems, InvoiceLineItemsInsert, InvoiceLineItemsUpdate } from "../types/invoice-line-items";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "invoice_line_items";

const SELECT_BY_ID = "SELECT * FROM invoice_line_items WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM invoice_line_items WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM invoice_line_items";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM invoice_line_items`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: InvoiceLineItemsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.invoice_id !== undefined) {
    columns.push("invoice_id");
    values.push(data.invoice_id);
    placeholders.push("?");
  }
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.quantity !== undefined) {
    columns.push("quantity");
    values.push(data.quantity);
    placeholders.push("?");
  }
  if (data.unit_price !== undefined) {
    columns.push("unit_price");
    values.push(data.unit_price);
    placeholders.push("?");
  }
  if (data.amount !== undefined) {
    columns.push("amount");
    values.push(data.amount);
    placeholders.push("?");
  }
  if (data.type !== undefined) {
    columns.push("type");
    values.push(data.type);
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
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO invoice_line_items (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: InvoiceLineItemsUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.invoice_id !== undefined) {
    sets.push("invoice_id = ?");
    values.push(data.invoice_id);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.quantity !== undefined) {
    sets.push("quantity = ?");
    values.push(data.quantity);
  }
  if (data.unit_price !== undefined) {
    sets.push("unit_price = ?");
    values.push(data.unit_price);
  }
  if (data.amount !== undefined) {
    sets.push("amount = ?");
    values.push(data.amount);
  }
  if (data.type !== undefined) {
    sets.push("type = ?");
    values.push(data.type);
  }
  if (data.period_start !== undefined) {
    sets.push("period_start = ?");
    values.push(data.period_start);
  }
  if (data.period_end !== undefined) {
    sets.push("period_end = ?");
    values.push(data.period_end);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  const sql = `UPDATE invoice_line_items SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class InvoiceLineItemsRepository {
  constructor(private db: Database) {}

  findById(id: string): InvoiceLineItems | null {
    return this.db.query<InvoiceLineItems, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): InvoiceLineItems[] {
    return this.db.query<InvoiceLineItems, []>(buildSelectAll(options)).all();
  }

  create(data: InvoiceLineItemsInsert): InvoiceLineItems {
    const { sql, params } = buildInsert(data);
    return this.db.query<InvoiceLineItems, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: InvoiceLineItemsUpdate): InvoiceLineItems | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<InvoiceLineItems, unknown[]>(sql).get(...params) ?? null;
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