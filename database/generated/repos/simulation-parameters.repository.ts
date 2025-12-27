/**
 * Repository for simulation_parameters
 * Source: 09_simulation.sql
 */

import { Database } from "bun:sqlite";
import type { SimulationParameters, SimulationParametersInsert, SimulationParametersUpdate } from "../types/simulation-parameters";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "simulation_parameters";

const SELECT_BY_ID = "SELECT * FROM simulation_parameters WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM simulation_parameters WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM simulation_parameters";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM simulation_parameters`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: SimulationParametersInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.simulation_model_id !== undefined) {
    columns.push("simulation_model_id");
    values.push(data.simulation_model_id);
    placeholders.push("?");
  }
  if (data.element_type !== undefined) {
    columns.push("element_type");
    values.push(data.element_type);
    placeholders.push("?");
  }
  if (data.element_name !== undefined) {
    columns.push("element_name");
    values.push(data.element_name);
    placeholders.push("?");
  }
  if (data.parameter_name !== undefined) {
    columns.push("parameter_name");
    values.push(data.parameter_name);
    placeholders.push("?");
  }
  if (data.distribution !== undefined) {
    columns.push("distribution");
    values.push(data.distribution);
    placeholders.push("?");
  }
  if (data.distribution_params !== undefined) {
    columns.push("distribution_params");
    values.push(data.distribution_params);
    placeholders.push("?");
  }
  if (data.source !== undefined) {
    columns.push("source");
    values.push(data.source);
    placeholders.push("?");
  }

  const sql = `INSERT INTO simulation_parameters (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: SimulationParametersUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.simulation_model_id !== undefined) {
    sets.push("simulation_model_id = ?");
    values.push(data.simulation_model_id);
  }
  if (data.element_type !== undefined) {
    sets.push("element_type = ?");
    values.push(data.element_type);
  }
  if (data.element_name !== undefined) {
    sets.push("element_name = ?");
    values.push(data.element_name);
  }
  if (data.parameter_name !== undefined) {
    sets.push("parameter_name = ?");
    values.push(data.parameter_name);
  }
  if (data.distribution !== undefined) {
    sets.push("distribution = ?");
    values.push(data.distribution);
  }
  if (data.distribution_params !== undefined) {
    sets.push("distribution_params = ?");
    values.push(data.distribution_params);
  }
  if (data.source !== undefined) {
    sets.push("source = ?");
    values.push(data.source);
  }

  values.push(id);
  const sql = `UPDATE simulation_parameters SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class SimulationParametersRepository {
  constructor(private db: Database) {}

  findById(id: string): SimulationParameters | null {
    return this.db.query<SimulationParameters, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): SimulationParameters[] {
    return this.db.query<SimulationParameters, []>(buildSelectAll(options)).all();
  }

  create(data: SimulationParametersInsert): SimulationParameters {
    const { sql, params } = buildInsert(data);
    return this.db.query<SimulationParameters, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: SimulationParametersUpdate): SimulationParameters | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<SimulationParameters, unknown[]>(sql).get(...params) ?? null;
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