/**
 * Repository for graph_queries
 * Source: 11_graph.sql
 */

import { Database } from "bun:sqlite";
import type { GraphQueries, GraphQueriesInsert, GraphQueriesUpdate } from "../types/graph-queries";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "graph_queries";

const SELECT_BY_ID = "SELECT * FROM graph_queries WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM graph_queries WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM graph_queries WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM graph_queries`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: GraphQueriesInsert): { sql: string; params: unknown[] } {
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
  if (data.category !== undefined) {
    columns.push("category");
    values.push(data.category);
    placeholders.push("?");
  }
  if (data.cypher_query !== undefined) {
    columns.push("cypher_query");
    values.push(data.cypher_query);
    placeholders.push("?");
  }
  if (data.parameters !== undefined) {
    columns.push("parameters");
    values.push(JSON.stringify(data.parameters));
    placeholders.push("?");
  }
  if (data.return_type !== undefined) {
    columns.push("return_type");
    values.push(data.return_type);
    placeholders.push("?");
  }

  const sql = `INSERT INTO graph_queries (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: GraphQueriesUpdate, tenantId: string): { sql: string; params: unknown[] } {
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
  if (data.category !== undefined) {
    sets.push("category = ?");
    values.push(data.category);
  }
  if (data.cypher_query !== undefined) {
    sets.push("cypher_query = ?");
    values.push(data.cypher_query);
  }
  if (data.parameters !== undefined) {
    sets.push("parameters = ?");
    values.push(JSON.stringify(data.parameters));
  }
  if (data.return_type !== undefined) {
    sets.push("return_type = ?");
    values.push(data.return_type);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE graph_queries SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class GraphQueriesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): GraphQueries | null {
    return this.db.query<GraphQueries, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): GraphQueries[] {
    return this.db.query<GraphQueries, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: GraphQueriesInsert): GraphQueries {
    const { sql, params } = buildInsert(data);
    return this.db.query<GraphQueries, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: GraphQueriesUpdate, tenantId: string): GraphQueries | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<GraphQueries, unknown[]>(sql).get(...params) ?? null;
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