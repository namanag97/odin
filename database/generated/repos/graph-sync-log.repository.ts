/**
 * Repository for graph_sync_log
 * Source: 11_graph.sql
 */

import { Database } from "bun:sqlite";
import type { GraphSyncLog, GraphSyncLogInsert, GraphSyncLogUpdate } from "../types/graph-sync-log";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "graph_sync_log";

const SELECT_BY_ID = "SELECT * FROM graph_sync_log WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM graph_sync_log WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM graph_sync_log WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM graph_sync_log`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: GraphSyncLogInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.projection_id !== undefined) {
    columns.push("projection_id");
    values.push(data.projection_id);
    placeholders.push("?");
  }
  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
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
  if (data.nodes_created !== undefined) {
    columns.push("nodes_created");
    values.push(data.nodes_created);
    placeholders.push("?");
  }
  if (data.nodes_updated !== undefined) {
    columns.push("nodes_updated");
    values.push(data.nodes_updated);
    placeholders.push("?");
  }
  if (data.nodes_deleted !== undefined) {
    columns.push("nodes_deleted");
    values.push(data.nodes_deleted);
    placeholders.push("?");
  }
  if (data.relationships_created !== undefined) {
    columns.push("relationships_created");
    values.push(data.relationships_created);
    placeholders.push("?");
  }
  if (data.relationships_deleted !== undefined) {
    columns.push("relationships_deleted");
    values.push(data.relationships_deleted);
    placeholders.push("?");
  }
  if (data.error_message !== undefined) {
    columns.push("error_message");
    values.push(data.error_message);
    placeholders.push("?");
  }
  if (data.sync_checkpoint !== undefined) {
    columns.push("sync_checkpoint");
    values.push(data.sync_checkpoint);
    placeholders.push("?");
  }

  const sql = `INSERT INTO graph_sync_log (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: GraphSyncLogUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.projection_id !== undefined) {
    sets.push("projection_id = ?");
    values.push(data.projection_id);
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
  if (data.nodes_created !== undefined) {
    sets.push("nodes_created = ?");
    values.push(data.nodes_created);
  }
  if (data.nodes_updated !== undefined) {
    sets.push("nodes_updated = ?");
    values.push(data.nodes_updated);
  }
  if (data.nodes_deleted !== undefined) {
    sets.push("nodes_deleted = ?");
    values.push(data.nodes_deleted);
  }
  if (data.relationships_created !== undefined) {
    sets.push("relationships_created = ?");
    values.push(data.relationships_created);
  }
  if (data.relationships_deleted !== undefined) {
    sets.push("relationships_deleted = ?");
    values.push(data.relationships_deleted);
  }
  if (data.error_message !== undefined) {
    sets.push("error_message = ?");
    values.push(data.error_message);
  }
  if (data.sync_checkpoint !== undefined) {
    sets.push("sync_checkpoint = ?");
    values.push(data.sync_checkpoint);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE graph_sync_log SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class GraphSyncLogRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): GraphSyncLog | null {
    return this.db.query<GraphSyncLog, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): GraphSyncLog[] {
    return this.db.query<GraphSyncLog, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: GraphSyncLogInsert): GraphSyncLog {
    const { sql, params } = buildInsert(data);
    return this.db.query<GraphSyncLog, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: GraphSyncLogUpdate, tenantId: string): GraphSyncLog | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<GraphSyncLog, unknown[]>(sql).get(...params) ?? null;
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