/**
 * Repository for ontologies
 * Source: 04_ontology.sql
 */

import { Database } from "bun:sqlite";
import type { Ontologies, OntologiesInsert, OntologiesUpdate } from "../types/ontologies";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "ontologies";

const SELECT_BY_ID = "SELECT * FROM ontologies WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM ontologies WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM ontologies WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM ontologies`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: OntologiesInsert): { sql: string; params: unknown[] } {
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
  if (data.version !== undefined) {
    columns.push("version");
    values.push(data.version);
    placeholders.push("?");
  }
  if (data.iri !== undefined) {
    columns.push("iri");
    values.push(data.iri);
    placeholders.push("?");
  }
  if (data.description !== undefined) {
    columns.push("description");
    values.push(data.description);
    placeholders.push("?");
  }
  if (data.format !== undefined) {
    columns.push("format");
    values.push(data.format);
    placeholders.push("?");
  }
  if (data.content !== undefined) {
    columns.push("content");
    values.push(data.content);
    placeholders.push("?");
  }
  if (data.imported_iris !== undefined) {
    columns.push("imported_iris");
    values.push(JSON.stringify(data.imported_iris));
    placeholders.push("?");
  }
  if (data.statistics !== undefined) {
    columns.push("statistics");
    values.push(JSON.stringify(data.statistics));
    placeholders.push("?");
  }
  if (data.is_active !== undefined) {
    columns.push("is_active");
    values.push(data.is_active);
    placeholders.push("?");
  }

  const sql = `INSERT INTO ontologies (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: OntologiesUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.version !== undefined) {
    sets.push("version = ?");
    values.push(data.version);
  }
  if (data.iri !== undefined) {
    sets.push("iri = ?");
    values.push(data.iri);
  }
  if (data.description !== undefined) {
    sets.push("description = ?");
    values.push(data.description);
  }
  if (data.format !== undefined) {
    sets.push("format = ?");
    values.push(data.format);
  }
  if (data.content !== undefined) {
    sets.push("content = ?");
    values.push(data.content);
  }
  if (data.imported_iris !== undefined) {
    sets.push("imported_iris = ?");
    values.push(JSON.stringify(data.imported_iris));
  }
  if (data.statistics !== undefined) {
    sets.push("statistics = ?");
    values.push(JSON.stringify(data.statistics));
  }
  if (data.is_active !== undefined) {
    sets.push("is_active = ?");
    values.push(data.is_active);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE ontologies SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class OntologiesRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Ontologies | null {
    return this.db.query<Ontologies, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Ontologies[] {
    return this.db.query<Ontologies, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: OntologiesInsert): Ontologies {
    const { sql, params } = buildInsert(data);
    return this.db.query<Ontologies, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: OntologiesUpdate, tenantId: string): Ontologies | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Ontologies, unknown[]>(sql).get(...params) ?? null;
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