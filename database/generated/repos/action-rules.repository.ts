/**
 * Repository for action_rules
 * Source: 10_automation.sql
 */

import { Database } from "bun:sqlite";
import type { ActionRules, ActionRulesInsert, ActionRulesUpdate } from "../types/action-rules";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "action_rules";

const SELECT_BY_ID = "SELECT * FROM action_rules WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM action_rules WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM action_rules WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM action_rules`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ActionRulesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.event_log_id !== undefined) {
    columns.push("event_log_id");
    values.push(data.event_log_id);
    placeholders.push("?");
  }
  if (data.data_pool_id !== undefined) {
    columns.push("data_pool_id");
    values.push(data.data_pool_id);
    placeholders.push("?");
  }
  if (data.rule_type !== undefined) {
    columns.push("rule_type");
    values.push(data.rule_type);
    placeholders.push("?");
  }
  if (data.condition !== undefined) {
    columns.push("condition");
    values.push(data.condition);
    placeholders.push("?");
  }
  if (data.is_active !== undefined) {
    columns.push("is_active");
    values.push(data.is_active);
    placeholders.push("?");
  }
  if (data.cooldown_seconds !== undefined) {
    columns.push("cooldown_seconds");
    values.push(data.cooldown_seconds);
    placeholders.push("?");
  }
  if (data.last_triggered_at !== undefined) {
    columns.push("last_triggered_at");
    values.push(data.last_triggered_at);
    placeholders.push("?");
  }
  if (data.trigger_count !== undefined) {
    columns.push("trigger_count");
    values.push(data.trigger_count);
    placeholders.push("?");
  }

  const sql = `INSERT INTO action_rules (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ActionRulesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.event_log_id !== undefined) {
    sets.push("event_log_id = ?");
    values.push(data.event_log_id);
  }
  if (data.data_pool_id !== undefined) {
    sets.push("data_pool_id = ?");
    values.push(data.data_pool_id);
  }
  if (data.rule_type !== undefined) {
    sets.push("rule_type = ?");
    values.push(data.rule_type);
  }
  if (data.condition !== undefined) {
    sets.push("condition = ?");
    values.push(data.condition);
  }
  if (data.is_active !== undefined) {
    sets.push("is_active = ?");
    values.push(data.is_active);
  }
  if (data.cooldown_seconds !== undefined) {
    sets.push("cooldown_seconds = ?");
    values.push(data.cooldown_seconds);
  }
  if (data.last_triggered_at !== undefined) {
    sets.push("last_triggered_at = ?");
    values.push(data.last_triggered_at);
  }
  if (data.trigger_count !== undefined) {
    sets.push("trigger_count = ?");
    values.push(data.trigger_count);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE action_rules SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ActionRulesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ActionRules | null {
    return this.db.query<ActionRules, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ActionRules[] {
    return this.db.query<ActionRules, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ActionRulesInsert): ActionRules {
    const { sql, params } = buildInsert(data);
    return this.db.query<ActionRules, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ActionRulesUpdate, tenantId: string): ActionRules | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ActionRules, unknown[]>(sql).get(...params) ?? null;
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