/**
 * Repository for concept_relations
 * Source: 04_ontology.sql
 */

import { Database } from "bun:sqlite";
import type { ConceptRelations, ConceptRelationsInsert, ConceptRelationsUpdate } from "../types/concept-relations";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "concept_relations";

const SELECT_BY_ID = "SELECT * FROM concept_relations WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM concept_relations WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM concept_relations WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM concept_relations`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ConceptRelationsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.source_concept_id !== undefined) {
    columns.push("source_concept_id");
    values.push(data.source_concept_id);
    placeholders.push("?");
  }
  if (data.target_concept_id !== undefined) {
    columns.push("target_concept_id");
    values.push(data.target_concept_id);
    placeholders.push("?");
  }
  if (data.relation_type !== undefined) {
    columns.push("relation_type");
    values.push(data.relation_type);
    placeholders.push("?");
  }
  if (data.relation_iri !== undefined) {
    columns.push("relation_iri");
    values.push(data.relation_iri);
    placeholders.push("?");
  }
  if (data.cardinality !== undefined) {
    columns.push("cardinality");
    values.push(data.cardinality);
    placeholders.push("?");
  }
  if (data.metadata !== undefined) {
    columns.push("metadata");
    values.push(JSON.stringify(data.metadata));
    placeholders.push("?");
  }

  const sql = `INSERT INTO concept_relations (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ConceptRelationsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.source_concept_id !== undefined) {
    sets.push("source_concept_id = ?");
    values.push(data.source_concept_id);
  }
  if (data.target_concept_id !== undefined) {
    sets.push("target_concept_id = ?");
    values.push(data.target_concept_id);
  }
  if (data.relation_type !== undefined) {
    sets.push("relation_type = ?");
    values.push(data.relation_type);
  }
  if (data.relation_iri !== undefined) {
    sets.push("relation_iri = ?");
    values.push(data.relation_iri);
  }
  if (data.cardinality !== undefined) {
    sets.push("cardinality = ?");
    values.push(data.cardinality);
  }
  if (data.metadata !== undefined) {
    sets.push("metadata = ?");
    values.push(JSON.stringify(data.metadata));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE concept_relations SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ConceptRelationsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ConceptRelations | null {
    return this.db.query<ConceptRelations, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ConceptRelations[] {
    return this.db.query<ConceptRelations, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ConceptRelationsInsert): ConceptRelations {
    const { sql, params } = buildInsert(data);
    return this.db.query<ConceptRelations, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ConceptRelationsUpdate, tenantId: string): ConceptRelations | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ConceptRelations, unknown[]>(sql).get(...params) ?? null;
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