/**
 * Repository for announcements
 * Source: 26_communication_layer.sql
 */

import { Database } from "bun:sqlite";
import type { Announcements, AnnouncementsInsert, AnnouncementsUpdate } from "../types/announcements";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "announcements";

const SELECT_BY_ID = "SELECT * FROM announcements WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM announcements WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM announcements WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM announcements`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: AnnouncementsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.title !== undefined) {
    columns.push("title");
    values.push(data.title);
    placeholders.push("?");
  }
  if (data.body !== undefined) {
    columns.push("body");
    values.push(data.body);
    placeholders.push("?");
  }
  if (data.type !== undefined) {
    columns.push("type");
    values.push(data.type);
    placeholders.push("?");
  }
  if (data.target_audience !== undefined) {
    columns.push("target_audience");
    values.push(data.target_audience);
    placeholders.push("?");
  }
  if (data.segment_rules !== undefined) {
    columns.push("segment_rules");
    values.push(data.segment_rules);
    placeholders.push("?");
  }
  if (data.action_url !== undefined) {
    columns.push("action_url");
    values.push(data.action_url);
    placeholders.push("?");
  }
  if (data.starts_at !== undefined) {
    columns.push("starts_at");
    values.push(data.starts_at);
    placeholders.push("?");
  }
  if (data.ends_at !== undefined) {
    columns.push("ends_at");
    values.push(data.ends_at);
    placeholders.push("?");
  }
  if (data.is_dismissible !== undefined) {
    columns.push("is_dismissible");
    values.push(data.is_dismissible);
    placeholders.push("?");
  }
  if (data.is_active !== undefined) {
    columns.push("is_active");
    values.push(data.is_active);
    placeholders.push("?");
  }
  if (data.created_by !== undefined) {
    columns.push("created_by");
    values.push(data.created_by);
    placeholders.push("?");
  }

  const sql = `INSERT INTO announcements (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: AnnouncementsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.title !== undefined) {
    sets.push("title = ?");
    values.push(data.title);
  }
  if (data.body !== undefined) {
    sets.push("body = ?");
    values.push(data.body);
  }
  if (data.type !== undefined) {
    sets.push("type = ?");
    values.push(data.type);
  }
  if (data.target_audience !== undefined) {
    sets.push("target_audience = ?");
    values.push(data.target_audience);
  }
  if (data.segment_rules !== undefined) {
    sets.push("segment_rules = ?");
    values.push(data.segment_rules);
  }
  if (data.action_url !== undefined) {
    sets.push("action_url = ?");
    values.push(data.action_url);
  }
  if (data.starts_at !== undefined) {
    sets.push("starts_at = ?");
    values.push(data.starts_at);
  }
  if (data.ends_at !== undefined) {
    sets.push("ends_at = ?");
    values.push(data.ends_at);
  }
  if (data.is_dismissible !== undefined) {
    sets.push("is_dismissible = ?");
    values.push(data.is_dismissible);
  }
  if (data.is_active !== undefined) {
    sets.push("is_active = ?");
    values.push(data.is_active);
  }
  if (data.created_by !== undefined) {
    sets.push("created_by = ?");
    values.push(data.created_by);
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE announcements SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class AnnouncementsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): Announcements | null {
    return this.db.query<Announcements, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): Announcements[] {
    return this.db.query<Announcements, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: AnnouncementsInsert): Announcements {
    const { sql, params } = buildInsert(data);
    return this.db.query<Announcements, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: AnnouncementsUpdate, tenantId: string): Announcements | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<Announcements, unknown[]>(sql).get(...params) ?? null;
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