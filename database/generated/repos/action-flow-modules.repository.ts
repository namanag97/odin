/**
 * Repository for action_flow_modules
 * Source: 18_automation_enhanced.sql
 */

import { Database } from "bun:sqlite";
import type { ActionFlowModules, ActionFlowModulesInsert, ActionFlowModulesUpdate } from "../types/action-flow-modules";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "action_flow_modules";

const SELECT_BY_ID = "SELECT * FROM action_flow_modules WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM action_flow_modules WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM action_flow_modules WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM action_flow_modules`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ActionFlowModulesInsert): { sql: string; params: unknown[] } {
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
  if (data.parent_module_id !== undefined) {
    columns.push("parent_module_id");
    values.push(data.parent_module_id);
    placeholders.push("?");
  }
  if (data.module_type !== undefined) {
    columns.push("module_type");
    values.push(data.module_type);
    placeholders.push("?");
  }
  if (data.app_name !== undefined) {
    columns.push("app_name");
    values.push(data.app_name);
    placeholders.push("?");
  }
  if (data.action_name !== undefined) {
    columns.push("action_name");
    values.push(data.action_name);
    placeholders.push("?");
  }
  if (data.connection_id !== undefined) {
    columns.push("connection_id");
    values.push(data.connection_id);
    placeholders.push("?");
  }
  if (data.position !== undefined) {
    columns.push("position");
    values.push(data.position);
    placeholders.push("?");
  }
  if (data.configuration !== undefined) {
    columns.push("configuration");
    values.push(JSON.stringify(data.configuration));
    placeholders.push("?");
  }
  if (data.input_mapping !== undefined) {
    columns.push("input_mapping");
    values.push(JSON.stringify(data.input_mapping));
    placeholders.push("?");
  }
  if (data.output_mapping !== undefined) {
    columns.push("output_mapping");
    values.push(JSON.stringify(data.output_mapping));
    placeholders.push("?");
  }
  if (data.error_handler_type !== undefined) {
    columns.push("error_handler_type");
    values.push(data.error_handler_type);
    placeholders.push("?");
  }
  if (data.is_acid !== undefined) {
    columns.push("is_acid");
    values.push(data.is_acid);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO action_flow_modules (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ActionFlowModulesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.action_flow_id !== undefined) {
    sets.push("action_flow_id = ?");
    values.push(data.action_flow_id);
  }
  if (data.parent_module_id !== undefined) {
    sets.push("parent_module_id = ?");
    values.push(data.parent_module_id);
  }
  if (data.module_type !== undefined) {
    sets.push("module_type = ?");
    values.push(data.module_type);
  }
  if (data.app_name !== undefined) {
    sets.push("app_name = ?");
    values.push(data.app_name);
  }
  if (data.action_name !== undefined) {
    sets.push("action_name = ?");
    values.push(data.action_name);
  }
  if (data.connection_id !== undefined) {
    sets.push("connection_id = ?");
    values.push(data.connection_id);
  }
  if (data.position !== undefined) {
    sets.push("position = ?");
    values.push(data.position);
  }
  if (data.configuration !== undefined) {
    sets.push("configuration = ?");
    values.push(JSON.stringify(data.configuration));
  }
  if (data.input_mapping !== undefined) {
    sets.push("input_mapping = ?");
    values.push(JSON.stringify(data.input_mapping));
  }
  if (data.output_mapping !== undefined) {
    sets.push("output_mapping = ?");
    values.push(JSON.stringify(data.output_mapping));
  }
  if (data.error_handler_type !== undefined) {
    sets.push("error_handler_type = ?");
    values.push(data.error_handler_type);
  }
  if (data.is_acid !== undefined) {
    sets.push("is_acid = ?");
    values.push(data.is_acid);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE action_flow_modules SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ActionFlowModulesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ActionFlowModules | null {
    return this.db.query<ActionFlowModules, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ActionFlowModules[] {
    return this.db.query<ActionFlowModules, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ActionFlowModulesInsert): ActionFlowModules {
    const { sql, params } = buildInsert(data);
    return this.db.query<ActionFlowModules, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ActionFlowModulesUpdate, tenantId: string): ActionFlowModules | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ActionFlowModules, unknown[]>(sql).get(...params) ?? null;
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