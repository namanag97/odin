/**
 * Repository for discovered_models
 * Source: 05_discovery.sql
 */

import { Database } from "bun:sqlite";
import type { DiscoveredModels, DiscoveredModelsInsert, DiscoveredModelsUpdate } from "../types/discovered-models";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "discovered_models";

const SELECT_BY_ID = "SELECT * FROM discovered_models WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM discovered_models WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM discovered_models WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM discovered_models`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: DiscoveredModelsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
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
  if (data.algorithm !== undefined) {
    columns.push("algorithm");
    values.push(data.algorithm);
    placeholders.push("?");
  }
  if (data.algorithm_params !== undefined) {
    columns.push("algorithm_params");
    values.push(JSON.stringify(data.algorithm_params));
    placeholders.push("?");
  }
  if (data.model_type !== undefined) {
    columns.push("model_type");
    values.push(data.model_type);
    placeholders.push("?");
  }
  if (data.model_data !== undefined) {
    columns.push("model_data");
    values.push(data.model_data);
    placeholders.push("?");
  }
  if (data.model_file_path !== undefined) {
    columns.push("model_file_path");
    values.push(data.model_file_path);
    placeholders.push("?");
  }
  if (data.quality_metrics !== undefined) {
    columns.push("quality_metrics");
    values.push(JSON.stringify(data.quality_metrics));
    placeholders.push("?");
  }
  if (data.statistics !== undefined) {
    columns.push("statistics");
    values.push(JSON.stringify(data.statistics));
    placeholders.push("?");
  }
  if (data.perspective !== undefined) {
    columns.push("perspective");
    values.push(data.perspective);
    placeholders.push("?");
  }

  const sql = `INSERT INTO discovered_models (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: DiscoveredModelsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.event_log_id !== undefined) {
    sets.push("event_log_id = ?");
    values.push(data.event_log_id);
  }
  if (data.data_pool_id !== undefined) {
    sets.push("data_pool_id = ?");
    values.push(data.data_pool_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.algorithm !== undefined) {
    sets.push("algorithm = ?");
    values.push(data.algorithm);
  }
  if (data.algorithm_params !== undefined) {
    sets.push("algorithm_params = ?");
    values.push(JSON.stringify(data.algorithm_params));
  }
  if (data.model_type !== undefined) {
    sets.push("model_type = ?");
    values.push(data.model_type);
  }
  if (data.model_data !== undefined) {
    sets.push("model_data = ?");
    values.push(data.model_data);
  }
  if (data.model_file_path !== undefined) {
    sets.push("model_file_path = ?");
    values.push(data.model_file_path);
  }
  if (data.quality_metrics !== undefined) {
    sets.push("quality_metrics = ?");
    values.push(JSON.stringify(data.quality_metrics));
  }
  if (data.statistics !== undefined) {
    sets.push("statistics = ?");
    values.push(JSON.stringify(data.statistics));
  }
  if (data.perspective !== undefined) {
    sets.push("perspective = ?");
    values.push(data.perspective);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE discovered_models SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class DiscoveredModelsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): DiscoveredModels | null {
    return this.db.query<DiscoveredModels, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): DiscoveredModels[] {
    return this.db.query<DiscoveredModels, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: DiscoveredModelsInsert): DiscoveredModels {
    const { sql, params } = buildInsert(data);
    return this.db.query<DiscoveredModels, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: DiscoveredModelsUpdate, tenantId: string): DiscoveredModels | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<DiscoveredModels, unknown[]>(sql).get(...params) ?? null;
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