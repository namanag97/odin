/**
 * Repository for annotations
 * Source: 04_ontology.sql
 */

import { Database } from "bun:sqlite";
import type { Annotations, AnnotationsInsert, AnnotationsUpdate } from "../types/annotations";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "annotations";

const SELECT_BY_ID = "SELECT * FROM annotations WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM annotations WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM annotations WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM annotations`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: AnnotationsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.concept_id !== undefined) {
    columns.push("concept_id");
    values.push(data.concept_id);
    placeholders.push("?");
  }
  if (data.entity_type !== undefined) {
    columns.push("entity_type");
    values.push(data.entity_type);
    placeholders.push("?");
  }
  if (data.entity_id !== undefined) {
    columns.push("entity_id");
    values.push(data.entity_id);
    placeholders.push("?");
  }
  if (data.confidence !== undefined) {
    columns.push("confidence");
    values.push(data.confidence);
    placeholders.push("?");
  }
  if (data.annotation_type !== undefined) {
    columns.push("annotation_type");
    values.push(data.annotation_type);
    placeholders.push("?");
  }
  if (data.reasoning_chain !== undefined) {
    columns.push("reasoning_chain");
    values.push(data.reasoning_chain);
    placeholders.push("?");
  }

  const sql = `INSERT INTO annotations (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: AnnotationsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.concept_id !== undefined) {
    sets.push("concept_id = ?");
    values.push(data.concept_id);
  }
  if (data.entity_type !== undefined) {
    sets.push("entity_type = ?");
    values.push(data.entity_type);
  }
  if (data.entity_id !== undefined) {
    sets.push("entity_id = ?");
    values.push(data.entity_id);
  }
  if (data.confidence !== undefined) {
    sets.push("confidence = ?");
    values.push(data.confidence);
  }
  if (data.annotation_type !== undefined) {
    sets.push("annotation_type = ?");
    values.push(data.annotation_type);
  }
  if (data.reasoning_chain !== undefined) {
    sets.push("reasoning_chain = ?");
    values.push(data.reasoning_chain);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE annotations SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class AnnotationsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Annotations | null {
    return this.db.query<Annotations, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Annotations[] {
    return this.db.query<Annotations, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: AnnotationsInsert): Annotations {
    const { sql, params } = buildInsert(data);
    return this.db.query<Annotations, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: AnnotationsUpdate, tenantId: string): Annotations | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Annotations, unknown[]>(sql).get(...params) ?? null;
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