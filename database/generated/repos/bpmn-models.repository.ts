/**
 * Repository for bpmn_models
 * Source: 05_discovery.sql
 */

import { Database } from "bun:sqlite";
import type { BpmnModels, BpmnModelsInsert, BpmnModelsUpdate } from "../types/bpmn-models";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "bpmn_models";

const SELECT_BY_ID = "SELECT * FROM bpmn_models WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM bpmn_models WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM bpmn_models WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM bpmn_models`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: BpmnModelsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.discovered_model_id !== undefined) {
    columns.push("discovered_model_id");
    values.push(data.discovered_model_id);
    placeholders.push("?");
  }
  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.bpmn_xml !== undefined) {
    columns.push("bpmn_xml");
    values.push(data.bpmn_xml);
    placeholders.push("?");
  }
  if (data.bpmn_json !== undefined) {
    columns.push("bpmn_json");
    values.push(data.bpmn_json);
    placeholders.push("?");
  }
  if (data.process_id !== undefined) {
    columns.push("process_id");
    values.push(data.process_id);
    placeholders.push("?");
  }
  if (data.pools !== undefined) {
    columns.push("pools");
    values.push(JSON.stringify(data.pools));
    placeholders.push("?");
  }
  if (data.element_count !== undefined) {
    columns.push("element_count");
    values.push(data.element_count);
    placeholders.push("?");
  }

  const sql = `INSERT INTO bpmn_models (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: BpmnModelsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.discovered_model_id !== undefined) {
    sets.push("discovered_model_id = ?");
    values.push(data.discovered_model_id);
  }
  if (data.bpmn_xml !== undefined) {
    sets.push("bpmn_xml = ?");
    values.push(data.bpmn_xml);
  }
  if (data.bpmn_json !== undefined) {
    sets.push("bpmn_json = ?");
    values.push(data.bpmn_json);
  }
  if (data.process_id !== undefined) {
    sets.push("process_id = ?");
    values.push(data.process_id);
  }
  if (data.pools !== undefined) {
    sets.push("pools = ?");
    values.push(JSON.stringify(data.pools));
  }
  if (data.element_count !== undefined) {
    sets.push("element_count = ?");
    values.push(data.element_count);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE bpmn_models SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class BpmnModelsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): BpmnModels | null {
    return this.db.query<BpmnModels, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): BpmnModels[] {
    return this.db.query<BpmnModels, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: BpmnModelsInsert): BpmnModels {
    const { sql, params } = buildInsert(data);
    return this.db.query<BpmnModels, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: BpmnModelsUpdate, tenantId: string): BpmnModels | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<BpmnModels, unknown[]>(sql).get(...params) ?? null;
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