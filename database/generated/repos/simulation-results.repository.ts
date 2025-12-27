/**
 * Repository for simulation_results
 * Source: 09_simulation.sql
 */

import { Database } from "bun:sqlite";
import type { SimulationResults, SimulationResultsInsert, SimulationResultsUpdate } from "../types/simulation-results";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "simulation_results";

const SELECT_BY_ID = "SELECT * FROM simulation_results WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM simulation_results WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM simulation_results WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM simulation_results`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: SimulationResultsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.simulation_run_id !== undefined) {
    columns.push("simulation_run_id");
    values.push(data.simulation_run_id);
    placeholders.push("?");
  }
  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.replication_number !== undefined) {
    columns.push("replication_number");
    values.push(data.replication_number);
    placeholders.push("?");
  }
  if (data.summary_statistics !== undefined) {
    columns.push("summary_statistics");
    values.push(data.summary_statistics);
    placeholders.push("?");
  }
  if (data.activity_statistics !== undefined) {
    columns.push("activity_statistics");
    values.push(data.activity_statistics);
    placeholders.push("?");
  }
  if (data.resource_statistics !== undefined) {
    columns.push("resource_statistics");
    values.push(data.resource_statistics);
    placeholders.push("?");
  }
  if (data.queue_statistics !== undefined) {
    columns.push("queue_statistics");
    values.push(JSON.stringify(data.queue_statistics));
    placeholders.push("?");
  }
  if (data.cost_analysis !== undefined) {
    columns.push("cost_analysis");
    values.push(JSON.stringify(data.cost_analysis));
    placeholders.push("?");
  }
  if (data.raw_output_path !== undefined) {
    columns.push("raw_output_path");
    values.push(data.raw_output_path);
    placeholders.push("?");
  }

  const sql = `INSERT INTO simulation_results (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: SimulationResultsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.simulation_run_id !== undefined) {
    sets.push("simulation_run_id = ?");
    values.push(data.simulation_run_id);
  }
  if (data.replication_number !== undefined) {
    sets.push("replication_number = ?");
    values.push(data.replication_number);
  }
  if (data.summary_statistics !== undefined) {
    sets.push("summary_statistics = ?");
    values.push(data.summary_statistics);
  }
  if (data.activity_statistics !== undefined) {
    sets.push("activity_statistics = ?");
    values.push(data.activity_statistics);
  }
  if (data.resource_statistics !== undefined) {
    sets.push("resource_statistics = ?");
    values.push(data.resource_statistics);
  }
  if (data.queue_statistics !== undefined) {
    sets.push("queue_statistics = ?");
    values.push(JSON.stringify(data.queue_statistics));
  }
  if (data.cost_analysis !== undefined) {
    sets.push("cost_analysis = ?");
    values.push(JSON.stringify(data.cost_analysis));
  }
  if (data.raw_output_path !== undefined) {
    sets.push("raw_output_path = ?");
    values.push(data.raw_output_path);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE simulation_results SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class SimulationResultsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): SimulationResults | null {
    return this.db.query<SimulationResults, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): SimulationResults[] {
    return this.db.query<SimulationResults, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: SimulationResultsInsert): SimulationResults {
    const { sql, params } = buildInsert(data);
    return this.db.query<SimulationResults, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: SimulationResultsUpdate, tenantId: string): SimulationResults | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<SimulationResults, unknown[]>(sql).get(...params) ?? null;
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