/**
 * Repository for kpis
 * Source: 16_semantic.sql
 */

import { Database } from "bun:sqlite";
import type { Kpis, KpisInsert, KpisUpdate } from "../types/kpis";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "kpis";

const SELECT_BY_ID = "SELECT * FROM kpis WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM kpis WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM kpis WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM kpis`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: KpisInsert): { sql: string; params: unknown[] } {
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
  if (data.key !== undefined) {
    columns.push("key");
    values.push(data.key);
    placeholders.push("?");
  }
  if (data.display_name !== undefined) {
    columns.push("display_name");
    values.push(data.display_name);
    placeholders.push("?");
  }
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.pql_expression !== undefined) {
    columns.push("pql_expression");
    values.push(data.pql_expression);
    placeholders.push("?");
  }
  if (data.return_type !== undefined) {
    columns.push("return_type");
    values.push(data.return_type);
    placeholders.push("?");
  }
  if (data.format_string !== undefined) {
    columns.push("format_string");
    values.push(data.format_string);
    placeholders.push("?");
  }
  if (data.unit !== undefined) {
    columns.push("unit");
    values.push(data.unit);
    placeholders.push("?");
  }
  if (data.unit_position !== undefined) {
    columns.push("unit_position");
    values.push(data.unit_position);
    placeholders.push("?");
  }
  if (data.aggregation_type !== undefined) {
    columns.push("aggregation_type");
    values.push(data.aggregation_type);
    placeholders.push("?");
  }
  if (data.is_global !== undefined) {
    columns.push("is_global");
    values.push(data.is_global);
    placeholders.push("?");
  }
  if (data.category !== undefined) {
    columns.push("category");
    values.push(data.category);
    placeholders.push("?");
  }
  if (data.parameters !== undefined) {
    columns.push("parameters");
    values.push(JSON.stringify(data.parameters));
    placeholders.push("?");
  }
  if (data.thresholds !== undefined) {
    columns.push("thresholds");
    values.push(JSON.stringify(data.thresholds));
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO kpis (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: KpisUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.knowledge_model_id !== undefined) {
    sets.push("knowledge_model_id = ?");
    values.push(data.knowledge_model_id);
  }
  if (data.key !== undefined) {
    sets.push("key = ?");
    values.push(data.key);
  }
  if (data.display_name !== undefined) {
    sets.push("display_name = ?");
    values.push(data.display_name);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.pql_expression !== undefined) {
    sets.push("pql_expression = ?");
    values.push(data.pql_expression);
  }
  if (data.return_type !== undefined) {
    sets.push("return_type = ?");
    values.push(data.return_type);
  }
  if (data.format_string !== undefined) {
    sets.push("format_string = ?");
    values.push(data.format_string);
  }
  if (data.unit !== undefined) {
    sets.push("unit = ?");
    values.push(data.unit);
  }
  if (data.unit_position !== undefined) {
    sets.push("unit_position = ?");
    values.push(data.unit_position);
  }
  if (data.aggregation_type !== undefined) {
    sets.push("aggregation_type = ?");
    values.push(data.aggregation_type);
  }
  if (data.is_global !== undefined) {
    sets.push("is_global = ?");
    values.push(data.is_global);
  }
  if (data.category !== undefined) {
    sets.push("category = ?");
    values.push(data.category);
  }
  if (data.parameters !== undefined) {
    sets.push("parameters = ?");
    values.push(JSON.stringify(data.parameters));
  }
  if (data.thresholds !== undefined) {
    sets.push("thresholds = ?");
    values.push(JSON.stringify(data.thresholds));
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE kpis SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class KpisRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Kpis | null {
    return this.db.query<Kpis, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Kpis[] {
    return this.db.query<Kpis, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: KpisInsert): Kpis {
    const { sql, params } = buildInsert(data);
    return this.db.query<Kpis, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: KpisUpdate, tenantId: string): Kpis | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Kpis, unknown[]>(sql).get(...params) ?? null;
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