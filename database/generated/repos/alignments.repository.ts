/**
 * Repository for alignments
 * Source: 06_conformance.sql
 */

import { Database } from "bun:sqlite";
import type { Alignments, AlignmentsInsert, AlignmentsUpdate } from "../types/alignments";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "alignments";

const SELECT_BY_ID = "SELECT * FROM alignments WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM alignments WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM alignments WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM alignments`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: AlignmentsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.conformance_result_id !== undefined) {
    columns.push("conformance_result_id");
    values.push(data.conformance_result_id);
    placeholders.push("?");
  }
  if (data.case_id !== undefined) {
    columns.push("case_id");
    values.push(data.case_id);
    placeholders.push("?");
  }
  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.alignment_cost !== undefined) {
    columns.push("alignment_cost");
    values.push(data.alignment_cost);
    placeholders.push("?");
  }
  if (data.fitness_value !== undefined) {
    columns.push("fitness_value");
    values.push(data.fitness_value);
    placeholders.push("?");
  }
  if (data.alignment_sequence !== undefined) {
    columns.push("alignment_sequence");
    values.push(data.alignment_sequence);
    placeholders.push("?");
  }
  if (data.trace_length !== undefined) {
    columns.push("trace_length");
    values.push(data.trace_length);
    placeholders.push("?");
  }
  if (data.model_length !== undefined) {
    columns.push("model_length");
    values.push(data.model_length);
    placeholders.push("?");
  }
  if (data.computation_time_ms !== undefined) {
    columns.push("computation_time_ms");
    values.push(data.computation_time_ms);
    placeholders.push("?");
  }

  const sql = `INSERT INTO alignments (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: AlignmentsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.conformance_result_id !== undefined) {
    sets.push("conformance_result_id = ?");
    values.push(data.conformance_result_id);
  }
  if (data.case_id !== undefined) {
    sets.push("case_id = ?");
    values.push(data.case_id);
  }
  if (data.alignment_cost !== undefined) {
    sets.push("alignment_cost = ?");
    values.push(data.alignment_cost);
  }
  if (data.fitness_value !== undefined) {
    sets.push("fitness_value = ?");
    values.push(data.fitness_value);
  }
  if (data.alignment_sequence !== undefined) {
    sets.push("alignment_sequence = ?");
    values.push(data.alignment_sequence);
  }
  if (data.trace_length !== undefined) {
    sets.push("trace_length = ?");
    values.push(data.trace_length);
  }
  if (data.model_length !== undefined) {
    sets.push("model_length = ?");
    values.push(data.model_length);
  }
  if (data.computation_time_ms !== undefined) {
    sets.push("computation_time_ms = ?");
    values.push(data.computation_time_ms);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE alignments SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class AlignmentsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Alignments | null {
    return this.db.query<Alignments, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Alignments[] {
    return this.db.query<Alignments, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: AlignmentsInsert): Alignments {
    const { sql, params } = buildInsert(data);
    return this.db.query<Alignments, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: AlignmentsUpdate, tenantId: string): Alignments | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Alignments, unknown[]>(sql).get(...params) ?? null;
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