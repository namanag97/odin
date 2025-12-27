/**
 * Repository for reasoning_rules
 * Source: 04_ontology.sql
 */

import { Database } from "bun:sqlite";
import type { ReasoningRules, ReasoningRulesInsert, ReasoningRulesUpdate } from "../types/reasoning-rules";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "reasoning_rules";

const SELECT_BY_ID = "SELECT * FROM reasoning_rules WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM reasoning_rules WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM reasoning_rules WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM reasoning_rules`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ReasoningRulesInsert): { sql: string; params: unknown[] } {
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
  if (data.rule_body !== undefined) {
    columns.push("rule_body");
    values.push(data.rule_body);
    placeholders.push("?");
  }
  if (data.rule_head !== undefined) {
    columns.push("rule_head");
    values.push(data.rule_head);
    placeholders.push("?");
  }
  if (data.rule_format !== undefined) {
    columns.push("rule_format");
    values.push(data.rule_format);
    placeholders.push("?");
  }
  if (data.priority !== undefined) {
    columns.push("priority");
    values.push(data.priority);
    placeholders.push("?");
  }
  if (data.is_active !== undefined) {
    columns.push("is_active");
    values.push(data.is_active);
    placeholders.push("?");
  }
  if (data.last_executed_at !== undefined) {
    columns.push("last_executed_at");
    values.push(data.last_executed_at);
    placeholders.push("?");
  }
  if (data.inferences_count !== undefined) {
    columns.push("inferences_count");
    values.push(data.inferences_count);
    placeholders.push("?");
  }

  const sql = `INSERT INTO reasoning_rules (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ReasoningRulesUpdate, tenantId: string): { sql: string; params: unknown[] } {
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
  if (data.rule_body !== undefined) {
    sets.push("rule_body = ?");
    values.push(data.rule_body);
  }
  if (data.rule_head !== undefined) {
    sets.push("rule_head = ?");
    values.push(data.rule_head);
  }
  if (data.rule_format !== undefined) {
    sets.push("rule_format = ?");
    values.push(data.rule_format);
  }
  if (data.priority !== undefined) {
    sets.push("priority = ?");
    values.push(data.priority);
  }
  if (data.is_active !== undefined) {
    sets.push("is_active = ?");
    values.push(data.is_active);
  }
  if (data.last_executed_at !== undefined) {
    sets.push("last_executed_at = ?");
    values.push(data.last_executed_at);
  }
  if (data.inferences_count !== undefined) {
    sets.push("inferences_count = ?");
    values.push(data.inferences_count);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE reasoning_rules SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ReasoningRulesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ReasoningRules | null {
    return this.db.query<ReasoningRules, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ReasoningRules[] {
    return this.db.query<ReasoningRules, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ReasoningRulesInsert): ReasoningRules {
    const { sql, params } = buildInsert(data);
    return this.db.query<ReasoningRules, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ReasoningRulesUpdate, tenantId: string): ReasoningRules | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ReasoningRules, unknown[]>(sql).get(...params) ?? null;
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