/**
 * Repository for augmented_attribute_values
 * Source: 16_semantic.sql
 */

import { Database } from "bun:sqlite";
import type { AugmentedAttributeValues, AugmentedAttributeValuesInsert, AugmentedAttributeValuesUpdate } from "../types/augmented-attribute-values";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "augmented_attribute_values";

const SELECT_BY_ID = "SELECT * FROM augmented_attribute_values WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM augmented_attribute_values WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM augmented_attribute_values WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM augmented_attribute_values`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: AugmentedAttributeValuesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.augmented_attribute_id !== undefined) {
    columns.push("augmented_attribute_id");
    values.push(data.augmented_attribute_id);
    placeholders.push("?");
  }
  if (data.record_key !== undefined) {
    columns.push("record_key");
    values.push(data.record_key);
    placeholders.push("?");
  }
  if (data.value !== undefined) {
    columns.push("value");
    values.push(data.value);
    placeholders.push("?");
  }
  if (data.updated_by !== undefined) {
    columns.push("updated_by");
    values.push(data.updated_by);
    placeholders.push("?");
  }

  const sql = `INSERT INTO augmented_attribute_values (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: AugmentedAttributeValuesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.augmented_attribute_id !== undefined) {
    sets.push("augmented_attribute_id = ?");
    values.push(data.augmented_attribute_id);
  }
  if (data.record_key !== undefined) {
    sets.push("record_key = ?");
    values.push(data.record_key);
  }
  if (data.value !== undefined) {
    sets.push("value = ?");
    values.push(data.value);
  }
  if (data.updated_by !== undefined) {
    sets.push("updated_by = ?");
    values.push(data.updated_by);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE augmented_attribute_values SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class AugmentedAttributeValuesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): AugmentedAttributeValues | null {
    return this.db.query<AugmentedAttributeValues, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): AugmentedAttributeValues[] {
    return this.db.query<AugmentedAttributeValues, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: AugmentedAttributeValuesInsert): AugmentedAttributeValues {
    const { sql, params } = buildInsert(data);
    return this.db.query<AugmentedAttributeValues, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: AugmentedAttributeValuesUpdate, tenantId: string): AugmentedAttributeValues | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<AugmentedAttributeValues, unknown[]>(sql).get(...params) ?? null;
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