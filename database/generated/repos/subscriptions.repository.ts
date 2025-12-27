/**
 * Repository for subscriptions
 * Source: 22_commercial_layer.sql
 */

import { Database } from "bun:sqlite";
import type { Subscriptions, SubscriptionsInsert, SubscriptionsUpdate } from "../types/subscriptions";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "subscriptions";

const SELECT_BY_ID = "SELECT * FROM subscriptions WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM subscriptions WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM subscriptions WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM subscriptions`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: SubscriptionsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.plan_id !== undefined) {
    columns.push("plan_id");
    values.push(data.plan_id);
    placeholders.push("?");
  }
  if (data.external_id !== undefined) {
    columns.push("external_id");
    values.push(data.external_id);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.quantity !== undefined) {
    columns.push("quantity");
    values.push(data.quantity);
    placeholders.push("?");
  }
  if (data.billing_anchor_day !== undefined) {
    columns.push("billing_anchor_day");
    values.push(data.billing_anchor_day);
    placeholders.push("?");
  }
  if (data.current_period_start !== undefined) {
    columns.push("current_period_start");
    values.push(data.current_period_start);
    placeholders.push("?");
  }
  if (data.current_period_end !== undefined) {
    columns.push("current_period_end");
    values.push(data.current_period_end);
    placeholders.push("?");
  }
  if (data.trial_start !== undefined) {
    columns.push("trial_start");
    values.push(data.trial_start);
    placeholders.push("?");
  }
  if (data.trial_end !== undefined) {
    columns.push("trial_end");
    values.push(data.trial_end);
    placeholders.push("?");
  }
  if (data.canceled_at !== undefined) {
    columns.push("canceled_at");
    values.push(data.canceled_at);
    placeholders.push("?");
  }
  if (data.cancel_at_period_end !== undefined) {
    columns.push("cancel_at_period_end");
    values.push(data.cancel_at_period_end);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO subscriptions (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: SubscriptionsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.plan_id !== undefined) {
    sets.push("plan_id = ?");
    values.push(data.plan_id);
  }
  if (data.external_id !== undefined) {
    sets.push("external_id = ?");
    values.push(data.external_id);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.quantity !== undefined) {
    sets.push("quantity = ?");
    values.push(data.quantity);
  }
  if (data.billing_anchor_day !== undefined) {
    sets.push("billing_anchor_day = ?");
    values.push(data.billing_anchor_day);
  }
  if (data.current_period_start !== undefined) {
    sets.push("current_period_start = ?");
    values.push(data.current_period_start);
  }
  if (data.current_period_end !== undefined) {
    sets.push("current_period_end = ?");
    values.push(data.current_period_end);
  }
  if (data.trial_start !== undefined) {
    sets.push("trial_start = ?");
    values.push(data.trial_start);
  }
  if (data.trial_end !== undefined) {
    sets.push("trial_end = ?");
    values.push(data.trial_end);
  }
  if (data.canceled_at !== undefined) {
    sets.push("canceled_at = ?");
    values.push(data.canceled_at);
  }
  if (data.cancel_at_period_end !== undefined) {
    sets.push("cancel_at_period_end = ?");
    values.push(data.cancel_at_period_end);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE subscriptions SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class SubscriptionsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Subscriptions | null {
    return this.db.query<Subscriptions, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Subscriptions[] {
    return this.db.query<Subscriptions, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: SubscriptionsInsert): Subscriptions {
    const { sql, params } = buildInsert(data);
    return this.db.query<Subscriptions, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: SubscriptionsUpdate, tenantId: string): Subscriptions | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Subscriptions, unknown[]>(sql).get(...params) ?? null;
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