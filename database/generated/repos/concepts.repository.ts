/**
 * Repository for concepts
 * Source: 04_ontology.sql
 */

import { Database } from "bun:sqlite";
import type { Concepts, ConceptsInsert, ConceptsUpdate } from "../types/concepts";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "concepts";

const SELECT_BY_ID = "SELECT * FROM concepts WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM concepts WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM concepts WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM concepts`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ConceptsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.ontology_id !== undefined) {
    columns.push("ontology_id");
    values.push(data.ontology_id);
    placeholders.push("?");
  }
  if (data.iri !== undefined) {
    columns.push("iri");
    values.push(data.iri);
    placeholders.push("?");
  }
  if (data.local_name !== undefined) {
    columns.push("local_name");
    values.push(data.local_name);
    placeholders.push("?");
  }
  if (data.label !== undefined) {
    columns.push("label");
    values.push(data.label);
    placeholders.push("?");
  }
  if (data.definition !== undefined) {
    columns.push("definition");
    values.push(data.definition);
    placeholders.push("?");
  }
  if (data.concept_type !== undefined) {
    columns.push("concept_type");
    values.push(data.concept_type);
    placeholders.push("?");
  }
  if (data.parent_concept_id !== undefined) {
    columns.push("parent_concept_id");
    values.push(data.parent_concept_id);
    placeholders.push("?");
  }
  if (data.domain_concept_id !== undefined) {
    columns.push("domain_concept_id");
    values.push(data.domain_concept_id);
    placeholders.push("?");
  }
  if (data.range_concept_id !== undefined) {
    columns.push("range_concept_id");
    values.push(data.range_concept_id);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO concepts (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ConceptsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.ontology_id !== undefined) {
    sets.push("ontology_id = ?");
    values.push(data.ontology_id);
  }
  if (data.iri !== undefined) {
    sets.push("iri = ?");
    values.push(data.iri);
  }
  if (data.local_name !== undefined) {
    sets.push("local_name = ?");
    values.push(data.local_name);
  }
  if (data.label !== undefined) {
    sets.push("label = ?");
    values.push(data.label);
  }
  if (data.definition !== undefined) {
    sets.push("definition = ?");
    values.push(data.definition);
  }
  if (data.concept_type !== undefined) {
    sets.push("concept_type = ?");
    values.push(data.concept_type);
  }
  if (data.parent_concept_id !== undefined) {
    sets.push("parent_concept_id = ?");
    values.push(data.parent_concept_id);
  }
  if (data.domain_concept_id !== undefined) {
    sets.push("domain_concept_id = ?");
    values.push(data.domain_concept_id);
  }
  if (data.range_concept_id !== undefined) {
    sets.push("range_concept_id = ?");
    values.push(data.range_concept_id);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE concepts SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ConceptsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Concepts | null {
    return this.db.query<Concepts, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Concepts[] {
    return this.db.query<Concepts, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ConceptsInsert): Concepts {
    const { sql, params } = buildInsert(data);
    return this.db.query<Concepts, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ConceptsUpdate, tenantId: string): Concepts | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Concepts, unknown[]>(sql).get(...params) ?? null;
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