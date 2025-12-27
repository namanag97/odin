/**
 * Repository for simulation_models
 * Source: 09_simulation.sql
 */

import { Database } from "bun:sqlite";
import type { SimulationModels, SimulationModelsInsert, SimulationModelsUpdate } from "../types/simulation-models";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "simulation_models";

const SELECT_BY_ID = "SELECT * FROM simulation_models WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM simulation_models WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM simulation_models WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM simulation_models`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: SimulationModelsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.discovered_model_id !== undefined) {
    columns.push("discovered_model_id");
    values.push(data.discovered_model_id);
    placeholders.push("?");
  }
  if (data.event_log_id !== undefined) {
    columns.push("event_log_id");
    values.push(data.event_log_id);
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
  if (data.simulation_type !== undefined) {
    columns.push("simulation_type");
    values.push(data.simulation_type);
    placeholders.push("?");
  }
  if (data.base_configuration !== undefined) {
    columns.push("base_configuration");
    values.push(JSON.stringify(data.base_configuration));
    placeholders.push("?");
  }

  const sql = `INSERT INTO simulation_models (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: SimulationModelsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.discovered_model_id !== undefined) {
    sets.push("discovered_model_id = ?");
    values.push(data.discovered_model_id);
  }
  if (data.event_log_id !== undefined) {
    sets.push("event_log_id = ?");
    values.push(data.event_log_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.simulation_type !== undefined) {
    sets.push("simulation_type = ?");
    values.push(data.simulation_type);
  }
  if (data.base_configuration !== undefined) {
    sets.push("base_configuration = ?");
    values.push(JSON.stringify(data.base_configuration));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE simulation_models SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class SimulationModelsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): SimulationModels | null {
    return this.db.query<SimulationModels, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): SimulationModels[] {
    return this.db.query<SimulationModels, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: SimulationModelsInsert): SimulationModels {
    const { sql, params } = buildInsert(data);
    return this.db.query<SimulationModels, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: SimulationModelsUpdate, tenantId: string): SimulationModels | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<SimulationModels, unknown[]>(sql).get(...params) ?? null;
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