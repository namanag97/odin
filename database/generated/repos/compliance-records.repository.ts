/**
 * Repository for compliance_records
 * Source: 24_temporal_layer.sql
 */

import { Database } from "bun:sqlite";
import type { ComplianceRecords, ComplianceRecordsInsert, ComplianceRecordsUpdate } from "../types/compliance-records";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "compliance_records";

const SELECT_BY_ID = "SELECT * FROM compliance_records WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM compliance_records WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM compliance_records WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM compliance_records`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: ComplianceRecordsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.framework !== undefined) {
    columns.push("framework");
    values.push(data.framework);
    placeholders.push("?");
  }
  if (data.requirement_id !== undefined) {
    columns.push("requirement_id");
    values.push(data.requirement_id);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.evidence_type !== undefined) {
    columns.push("evidence_type");
    values.push(data.evidence_type);
    placeholders.push("?");
  }
  if (data.evidence !== undefined) {
    columns.push("evidence");
    values.push(JSON.stringify(data.evidence));
    placeholders.push("?");
  }
  if (data.assessed_at !== undefined) {
    columns.push("assessed_at");
    values.push(data.assessed_at);
    placeholders.push("?");
  }
  if (data.assessed_by !== undefined) {
    columns.push("assessed_by");
    values.push(data.assessed_by);
    placeholders.push("?");
  }
  if (data.next_review_at !== undefined) {
    columns.push("next_review_at");
    values.push(data.next_review_at);
    placeholders.push("?");
  }
  if (data.notes !== undefined) {
    columns.push("notes");
    values.push(data.notes);
    placeholders.push("?");
  }

  const sql = `INSERT INTO compliance_records (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: ComplianceRecordsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.framework !== undefined) {
    sets.push("framework = ?");
    values.push(data.framework);
  }
  if (data.requirement_id !== undefined) {
    sets.push("requirement_id = ?");
    values.push(data.requirement_id);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.evidence_type !== undefined) {
    sets.push("evidence_type = ?");
    values.push(data.evidence_type);
  }
  if (data.evidence !== undefined) {
    sets.push("evidence = ?");
    values.push(JSON.stringify(data.evidence));
  }
  if (data.assessed_at !== undefined) {
    sets.push("assessed_at = ?");
    values.push(data.assessed_at);
  }
  if (data.assessed_by !== undefined) {
    sets.push("assessed_by = ?");
    values.push(data.assessed_by);
  }
  if (data.next_review_at !== undefined) {
    sets.push("next_review_at = ?");
    values.push(data.next_review_at);
  }
  if (data.notes !== undefined) {
    sets.push("notes = ?");
    values.push(data.notes);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE compliance_records SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class ComplianceRecordsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): ComplianceRecords | null {
    return this.db.query<ComplianceRecords, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): ComplianceRecords[] {
    return this.db.query<ComplianceRecords, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: ComplianceRecordsInsert): ComplianceRecords {
    const { sql, params } = buildInsert(data);
    return this.db.query<ComplianceRecords, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: ComplianceRecordsUpdate, tenantId: string): ComplianceRecords | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<ComplianceRecords, unknown[]>(sql).get(...params) ?? null;
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