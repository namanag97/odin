/**
 * Repository for graph_projections
 * Source: 11_graph.sql
 */

import { Database } from "bun:sqlite";
import type { GraphProjections, GraphProjectionsInsert, GraphProjectionsUpdate } from "../types/graph-projections";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "graph_projections";

const SELECT_BY_ID = "SELECT * FROM graph_projections WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM graph_projections WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM graph_projections WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM graph_projections`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: GraphProjectionsInsert): { sql: string; params: unknown[] } {
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
  if (data.source_type !== undefined) {
    columns.push("source_type");
    values.push(data.source_type);
    placeholders.push("?");
  }
  if (data.source_id !== undefined) {
    columns.push("source_id");
    values.push(data.source_id);
    placeholders.push("?");
  }
  if (data.projection_config !== undefined) {
    columns.push("projection_config");
    values.push(JSON.stringify(data.projection_config));
    placeholders.push("?");
  }
  if (data.neo4j_database !== undefined) {
    columns.push("neo4j_database");
    values.push(data.neo4j_database);
    placeholders.push("?");
  }
  if (data.sync_mode !== undefined) {
    columns.push("sync_mode");
    values.push(data.sync_mode);
    placeholders.push("?");
  }
  if (data.sync_interval_seconds !== undefined) {
    columns.push("sync_interval_seconds");
    values.push(data.sync_interval_seconds);
    placeholders.push("?");
  }
  if (data.last_sync_at !== undefined) {
    columns.push("last_sync_at");
    values.push(data.last_sync_at);
    placeholders.push("?");
  }
  if (data.last_sync_status !== undefined) {
    columns.push("last_sync_status");
    values.push(data.last_sync_status);
    placeholders.push("?");
  }
  if (data.is_active !== undefined) {
    columns.push("is_active");
    values.push(data.is_active);
    placeholders.push("?");
  }

  const sql = `INSERT INTO graph_projections (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: GraphProjectionsUpdate, tenantId: string): { sql: string; params: unknown[] } {
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
  if (data.source_type !== undefined) {
    sets.push("source_type = ?");
    values.push(data.source_type);
  }
  if (data.source_id !== undefined) {
    sets.push("source_id = ?");
    values.push(data.source_id);
  }
  if (data.projection_config !== undefined) {
    sets.push("projection_config = ?");
    values.push(JSON.stringify(data.projection_config));
  }
  if (data.neo4j_database !== undefined) {
    sets.push("neo4j_database = ?");
    values.push(data.neo4j_database);
  }
  if (data.sync_mode !== undefined) {
    sets.push("sync_mode = ?");
    values.push(data.sync_mode);
  }
  if (data.sync_interval_seconds !== undefined) {
    sets.push("sync_interval_seconds = ?");
    values.push(data.sync_interval_seconds);
  }
  if (data.last_sync_at !== undefined) {
    sets.push("last_sync_at = ?");
    values.push(data.last_sync_at);
  }
  if (data.last_sync_status !== undefined) {
    sets.push("last_sync_status = ?");
    values.push(data.last_sync_status);
  }
  if (data.is_active !== undefined) {
    sets.push("is_active = ?");
    values.push(data.is_active);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE graph_projections SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class GraphProjectionsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): GraphProjections | null {
    return this.db.query<GraphProjections, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): GraphProjections[] {
    return this.db.query<GraphProjections, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: GraphProjectionsInsert): GraphProjections {
    const { sql, params } = buildInsert(data);
    return this.db.query<GraphProjections, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: GraphProjectionsUpdate, tenantId: string): GraphProjections | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<GraphProjections, unknown[]>(sql).get(...params) ?? null;
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