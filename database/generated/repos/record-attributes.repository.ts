/**
 * Repository for record_attributes
 * Source: 16_semantic.sql
 */

import { Database } from "bun:sqlite";
import type { RecordAttributes, RecordAttributesInsert, RecordAttributesUpdate } from "../types/record-attributes";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "record_attributes";

const SELECT_BY_ID = "SELECT * FROM record_attributes WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM record_attributes WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM record_attributes WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM record_attributes`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: RecordAttributesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.record_id !== undefined) {
    columns.push("record_id");
    values.push(data.record_id);
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
  if (data.attribute_type !== undefined) {
    columns.push("attribute_type");
    values.push(data.attribute_type);
    placeholders.push("?");
  }
  if (data.source_column !== undefined) {
    columns.push("source_column");
    values.push(data.source_column);
    placeholders.push("?");
  }
  if (data.pql_expression !== undefined) {
    columns.push("pql_expression");
    values.push(data.pql_expression);
    placeholders.push("?");
  }
  if (data.data_type !== undefined) {
    columns.push("data_type");
    values.push(data.data_type);
    placeholders.push("?");
  }
  if (data.format_string !== undefined) {
    columns.push("format_string");
    values.push(data.format_string);
    placeholders.push("?");
  }
  if (data.is_identifier !== undefined) {
    columns.push("is_identifier");
    values.push(data.is_identifier);
    placeholders.push("?");
  }
  if (data.is_filterable !== undefined) {
    columns.push("is_filterable");
    values.push(data.is_filterable);
    placeholders.push("?");
  }
  if (data.is_sortable !== undefined) {
    columns.push("is_sortable");
    values.push(data.is_sortable);
    placeholders.push("?");
  }
  if (data.ordinal_position !== undefined) {
    columns.push("ordinal_position");
    values.push(data.ordinal_position);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO record_attributes (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: RecordAttributesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.record_id !== undefined) {
    sets.push("record_id = ?");
    values.push(data.record_id);
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
  if (data.attribute_type !== undefined) {
    sets.push("attribute_type = ?");
    values.push(data.attribute_type);
  }
  if (data.source_column !== undefined) {
    sets.push("source_column = ?");
    values.push(data.source_column);
  }
  if (data.pql_expression !== undefined) {
    sets.push("pql_expression = ?");
    values.push(data.pql_expression);
  }
  if (data.data_type !== undefined) {
    sets.push("data_type = ?");
    values.push(data.data_type);
  }
  if (data.format_string !== undefined) {
    sets.push("format_string = ?");
    values.push(data.format_string);
  }
  if (data.is_identifier !== undefined) {
    sets.push("is_identifier = ?");
    values.push(data.is_identifier);
  }
  if (data.is_filterable !== undefined) {
    sets.push("is_filterable = ?");
    values.push(data.is_filterable);
  }
  if (data.is_sortable !== undefined) {
    sets.push("is_sortable = ?");
    values.push(data.is_sortable);
  }
  if (data.ordinal_position !== undefined) {
    sets.push("ordinal_position = ?");
    values.push(data.ordinal_position);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE record_attributes SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class RecordAttributesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): RecordAttributes | null {
    return this.db.query<RecordAttributes, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): RecordAttributes[] {
    return this.db.query<RecordAttributes, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: RecordAttributesInsert): RecordAttributes {
    const { sql, params } = buildInsert(data);
    return this.db.query<RecordAttributes, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: RecordAttributesUpdate, tenantId: string): RecordAttributes | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<RecordAttributes, unknown[]>(sql).get(...params) ?? null;
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