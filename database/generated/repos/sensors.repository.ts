/**
 * Repository for sensors
 * Source: 18_automation_enhanced.sql
 */

import { Database } from "bun:sqlite";
import type { Sensors, SensorsInsert, SensorsUpdate } from "../types/sensors";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "sensors";

const SELECT_BY_ID = "SELECT * FROM sensors WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM sensors WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM sensors WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM sensors`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: SensorsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.knowledge_model_id !== undefined) {
    columns.push("knowledge_model_id");
    values.push(data.knowledge_model_id);
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
  if (data.sensor_type !== undefined) {
    columns.push("sensor_type");
    values.push(data.sensor_type);
    placeholders.push("?");
  }
  if (data.record_id !== undefined) {
    columns.push("record_id");
    values.push(data.record_id);
    placeholders.push("?");
  }
  if (data.filter_id !== undefined) {
    columns.push("filter_id");
    values.push(data.filter_id);
    placeholders.push("?");
  }
  if (data.filter_expression !== undefined) {
    columns.push("filter_expression");
    values.push(data.filter_expression);
    placeholders.push("?");
  }
  if (data.identifier_columns !== undefined) {
    columns.push("identifier_columns");
    values.push(JSON.stringify(data.identifier_columns));
    placeholders.push("?");
  }
  if (data.additional_columns !== undefined) {
    columns.push("additional_columns");
    values.push(JSON.stringify(data.additional_columns));
    placeholders.push("?");
  }
  if (data.evaluation_trigger !== undefined) {
    columns.push("evaluation_trigger");
    values.push(data.evaluation_trigger);
    placeholders.push("?");
  }
  if (data.max_signals_per_evaluation !== undefined) {
    columns.push("max_signals_per_evaluation");
    values.push(data.max_signals_per_evaluation);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.last_evaluated_at !== undefined) {
    columns.push("last_evaluated_at");
    values.push(data.last_evaluated_at);
    placeholders.push("?");
  }
  if (data.last_signal_count !== undefined) {
    columns.push("last_signal_count");
    values.push(data.last_signal_count);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }
  if (data.created_by !== undefined) {
    columns.push("created_by");
    values.push(data.created_by);
    placeholders.push("?");
  }

  const sql = `INSERT INTO sensors (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: SensorsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.knowledge_model_id !== undefined) {
    sets.push("knowledge_model_id = ?");
    values.push(data.knowledge_model_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.sensor_type !== undefined) {
    sets.push("sensor_type = ?");
    values.push(data.sensor_type);
  }
  if (data.record_id !== undefined) {
    sets.push("record_id = ?");
    values.push(data.record_id);
  }
  if (data.filter_id !== undefined) {
    sets.push("filter_id = ?");
    values.push(data.filter_id);
  }
  if (data.filter_expression !== undefined) {
    sets.push("filter_expression = ?");
    values.push(data.filter_expression);
  }
  if (data.identifier_columns !== undefined) {
    sets.push("identifier_columns = ?");
    values.push(JSON.stringify(data.identifier_columns));
  }
  if (data.additional_columns !== undefined) {
    sets.push("additional_columns = ?");
    values.push(JSON.stringify(data.additional_columns));
  }
  if (data.evaluation_trigger !== undefined) {
    sets.push("evaluation_trigger = ?");
    values.push(data.evaluation_trigger);
  }
  if (data.max_signals_per_evaluation !== undefined) {
    sets.push("max_signals_per_evaluation = ?");
    values.push(data.max_signals_per_evaluation);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.last_evaluated_at !== undefined) {
    sets.push("last_evaluated_at = ?");
    values.push(data.last_evaluated_at);
  }
  if (data.last_signal_count !== undefined) {
    sets.push("last_signal_count = ?");
    values.push(data.last_signal_count);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }
  if (data.created_by !== undefined) {
    sets.push("created_by = ?");
    values.push(data.created_by);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE sensors SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class SensorsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Sensors | null {
    return this.db.query<Sensors, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Sensors[] {
    return this.db.query<Sensors, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: SensorsInsert): Sensors {
    const { sql, params } = buildInsert(data);
    return this.db.query<Sensors, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: SensorsUpdate, tenantId: string): Sensors | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Sensors, unknown[]>(sql).get(...params) ?? null;
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