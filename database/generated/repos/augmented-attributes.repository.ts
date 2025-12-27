/**
 * Repository for augmented_attributes
 * Source: 16_semantic.sql
 */

import { Database } from "bun:sqlite";
import type { AugmentedAttributes, AugmentedAttributesInsert, AugmentedAttributesUpdate } from "../types/augmented-attributes";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "augmented_attributes";

const SELECT_BY_ID = "SELECT * FROM augmented_attributes WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM augmented_attributes WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM augmented_attributes WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM augmented_attributes`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: AugmentedAttributesInsert): { sql: string; params: unknown[] } {
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
  if (data.data_type !== undefined) {
    columns.push("data_type");
    values.push(data.data_type);
    placeholders.push("?");
  }
  if (data.possible_values !== undefined) {
    columns.push("possible_values");
    values.push(data.possible_values);
    placeholders.push("?");
  }
  if (data.default_value !== undefined) {
    columns.push("default_value");
    values.push(data.default_value);
    placeholders.push("?");
  }
  if (data.is_required !== undefined) {
    columns.push("is_required");
    values.push(data.is_required);
    placeholders.push("?");
  }
  if (data.is_multi_value !== undefined) {
    columns.push("is_multi_value");
    values.push(data.is_multi_value);
    placeholders.push("?");
  }
  if (data.validation_regex !== undefined) {
    columns.push("validation_regex");
    values.push(data.validation_regex);
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

  const sql = `INSERT INTO augmented_attributes (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: AugmentedAttributesUpdate, tenantId: string): { sql: string; params: unknown[] } {
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
  if (data.data_type !== undefined) {
    sets.push("data_type = ?");
    values.push(data.data_type);
  }
  if (data.possible_values !== undefined) {
    sets.push("possible_values = ?");
    values.push(data.possible_values);
  }
  if (data.default_value !== undefined) {
    sets.push("default_value = ?");
    values.push(data.default_value);
  }
  if (data.is_required !== undefined) {
    sets.push("is_required = ?");
    values.push(data.is_required);
  }
  if (data.is_multi_value !== undefined) {
    sets.push("is_multi_value = ?");
    values.push(data.is_multi_value);
  }
  if (data.validation_regex !== undefined) {
    sets.push("validation_regex = ?");
    values.push(data.validation_regex);
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
  const sql = `UPDATE augmented_attributes SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class AugmentedAttributesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): AugmentedAttributes | null {
    return this.db.query<AugmentedAttributes, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): AugmentedAttributes[] {
    return this.db.query<AugmentedAttributes, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: AugmentedAttributesInsert): AugmentedAttributes {
    const { sql, params } = buildInsert(data);
    return this.db.query<AugmentedAttributes, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: AugmentedAttributesUpdate, tenantId: string): AugmentedAttributes | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<AugmentedAttributes, unknown[]>(sql).get(...params) ?? null;
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