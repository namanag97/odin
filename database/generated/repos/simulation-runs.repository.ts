/**
 * Repository for simulation_runs
 * Source: 09_simulation.sql
 */

import { Database } from "bun:sqlite";
import type { SimulationRuns, SimulationRunsInsert, SimulationRunsUpdate } from "../types/simulation-runs";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "simulation_runs";

const SELECT_BY_ID = "SELECT * FROM simulation_runs WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM simulation_runs WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM simulation_runs WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM simulation_runs`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: SimulationRunsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.simulation_model_id !== undefined) {
    columns.push("simulation_model_id");
    values.push(data.simulation_model_id);
    placeholders.push("?");
  }
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
  if (data.scenario_config !== undefined) {
    columns.push("scenario_config");
    values.push(JSON.stringify(data.scenario_config));
    placeholders.push("?");
  }
  if (data.random_seed !== undefined) {
    columns.push("random_seed");
    values.push(data.random_seed);
    placeholders.push("?");
  }
  if (data.started_at !== undefined) {
    columns.push("started_at");
    values.push(data.started_at);
    placeholders.push("?");
  }
  if (data.completed_at !== undefined) {
    columns.push("completed_at");
    values.push(data.completed_at);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.replications !== undefined) {
    columns.push("replications");
    values.push(data.replications);
    placeholders.push("?");
  }
  if (data.error_message !== undefined) {
    columns.push("error_message");
    values.push(data.error_message);
    placeholders.push("?");
  }

  const sql = `INSERT INTO simulation_runs (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: SimulationRunsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.simulation_model_id !== undefined) {
    sets.push("simulation_model_id = ?");
    values.push(data.simulation_model_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.scenario_config !== undefined) {
    sets.push("scenario_config = ?");
    values.push(JSON.stringify(data.scenario_config));
  }
  if (data.random_seed !== undefined) {
    sets.push("random_seed = ?");
    values.push(data.random_seed);
  }
  if (data.started_at !== undefined) {
    sets.push("started_at = ?");
    values.push(data.started_at);
  }
  if (data.completed_at !== undefined) {
    sets.push("completed_at = ?");
    values.push(data.completed_at);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.replications !== undefined) {
    sets.push("replications = ?");
    values.push(data.replications);
  }
  if (data.error_message !== undefined) {
    sets.push("error_message = ?");
    values.push(data.error_message);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE simulation_runs SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class SimulationRunsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): SimulationRuns | null {
    return this.db.query<SimulationRuns, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): SimulationRuns[] {
    return this.db.query<SimulationRuns, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: SimulationRunsInsert): SimulationRuns {
    const { sql, params } = buildInsert(data);
    return this.db.query<SimulationRuns, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: SimulationRunsUpdate, tenantId: string): SimulationRuns | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<SimulationRuns, unknown[]>(sql).get(...params) ?? null;
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