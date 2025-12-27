/**
 * Repository for uploads
 * Source: 00_uploads.sql
 */

import { Database } from "bun:sqlite";
import type { Uploads, UploadsInsert, UploadsUpdate } from "../types/uploads";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "uploads";

const SELECT_BY_ID = "SELECT * FROM uploads WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM uploads WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM uploads WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM uploads`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: UploadsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.filename !== undefined) {
    columns.push("filename");
    values.push(data.filename);
    placeholders.push("?");
  }
  if (data.original_filename !== undefined) {
    columns.push("original_filename");
    values.push(data.original_filename);
    placeholders.push("?");
  }
  if (data.file_size !== undefined) {
    columns.push("file_size");
    values.push(data.file_size);
    placeholders.push("?");
  }
  if (data.mime_type !== undefined) {
    columns.push("mime_type");
    values.push(data.mime_type);
    placeholders.push("?");
  }
  if (data.format !== undefined) {
    columns.push("format");
    values.push(data.format);
    placeholders.push("?");
  }
  if (data.status !== undefined) {
    columns.push("status");
    values.push(data.status);
    placeholders.push("?");
  }
  if (data.file_path !== undefined) {
    columns.push("file_path");
    values.push(data.file_path);
    placeholders.push("?");
  }
  if (data.detected_schema !== undefined) {
    columns.push("detected_schema");
    values.push(data.detected_schema);
    placeholders.push("?");
  }
  if (data.validation_result !== undefined) {
    columns.push("validation_result");
    values.push(data.validation_result);
    placeholders.push("?");
  }

  const sql = `INSERT INTO uploads (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: UploadsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.filename !== undefined) {
    sets.push("filename = ?");
    values.push(data.filename);
  }
  if (data.original_filename !== undefined) {
    sets.push("original_filename = ?");
    values.push(data.original_filename);
  }
  if (data.file_size !== undefined) {
    sets.push("file_size = ?");
    values.push(data.file_size);
  }
  if (data.mime_type !== undefined) {
    sets.push("mime_type = ?");
    values.push(data.mime_type);
  }
  if (data.format !== undefined) {
    sets.push("format = ?");
    values.push(data.format);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }
  if (data.file_path !== undefined) {
    sets.push("file_path = ?");
    values.push(data.file_path);
  }
  if (data.detected_schema !== undefined) {
    sets.push("detected_schema = ?");
    values.push(data.detected_schema);
  }
  if (data.validation_result !== undefined) {
    sets.push("validation_result = ?");
    values.push(data.validation_result);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE uploads SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class UploadsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Uploads | null {
    return this.db.query<Uploads, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Uploads[] {
    return this.db.query<Uploads, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: UploadsInsert): Uploads {
    const { sql, params } = buildInsert(data);
    return this.db.query<Uploads, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: UploadsUpdate, tenantId: string): Uploads | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Uploads, unknown[]>(sql).get(...params) ?? null;
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