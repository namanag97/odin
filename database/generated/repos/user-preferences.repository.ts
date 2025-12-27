/**
 * Repository for user_preferences
 * Source: 23_operational_layer.sql
 */

import { Database } from "bun:sqlite";
import type { UserPreferences, UserPreferencesInsert, UserPreferencesUpdate } from "../types/user-preferences";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "user_preferences";

const SELECT_BY_ID = "SELECT * FROM user_preferences WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM user_preferences WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM user_preferences";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM user_preferences`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: UserPreferencesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.user_id !== undefined) {
    columns.push("user_id");
    values.push(data.user_id);
    placeholders.push("?");
  }
  if (data.theme !== undefined) {
    columns.push("theme");
    values.push(data.theme);
    placeholders.push("?");
  }
  if (data.language !== undefined) {
    columns.push("language");
    values.push(data.language);
    placeholders.push("?");
  }
  if (data.timezone !== undefined) {
    columns.push("timezone");
    values.push(data.timezone);
    placeholders.push("?");
  }
  if (data.email_notifications !== undefined) {
    columns.push("email_notifications");
    values.push(JSON.stringify(data.email_notifications));
    placeholders.push("?");
  }
  if (data.push_notifications !== undefined) {
    columns.push("push_notifications");
    values.push(JSON.stringify(data.push_notifications));
    placeholders.push("?");
  }
  if (data.ui_preferences !== undefined) {
    columns.push("ui_preferences");
    values.push(JSON.stringify(data.ui_preferences));
    placeholders.push("?");
  }
  if (data.accessibility !== undefined) {
    columns.push("accessibility");
    values.push(JSON.stringify(data.accessibility));
    placeholders.push("?");
  }

  const sql = `INSERT INTO user_preferences (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: UserPreferencesUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.user_id !== undefined) {
    sets.push("user_id = ?");
    values.push(data.user_id);
  }
  if (data.theme !== undefined) {
    sets.push("theme = ?");
    values.push(data.theme);
  }
  if (data.language !== undefined) {
    sets.push("language = ?");
    values.push(data.language);
  }
  if (data.timezone !== undefined) {
    sets.push("timezone = ?");
    values.push(data.timezone);
  }
  if (data.email_notifications !== undefined) {
    sets.push("email_notifications = ?");
    values.push(JSON.stringify(data.email_notifications));
  }
  if (data.push_notifications !== undefined) {
    sets.push("push_notifications = ?");
    values.push(JSON.stringify(data.push_notifications));
  }
  if (data.ui_preferences !== undefined) {
    sets.push("ui_preferences = ?");
    values.push(JSON.stringify(data.ui_preferences));
  }
  if (data.accessibility !== undefined) {
    sets.push("accessibility = ?");
    values.push(JSON.stringify(data.accessibility));
  }

  values.push(id);
  const sql = `UPDATE user_preferences SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class UserPreferencesRepository {
  constructor(private db: Database) {}

  findById(id: string): UserPreferences | null {
    return this.db.query<UserPreferences, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): UserPreferences[] {
    return this.db.query<UserPreferences, []>(buildSelectAll(options)).all();
  }

  create(data: UserPreferencesInsert): UserPreferences {
    const { sql, params } = buildInsert(data);
    return this.db.query<UserPreferences, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: UserPreferencesUpdate): UserPreferences | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<UserPreferences, unknown[]>(sql).get(...params) ?? null;
  }

  delete(id: string): boolean {
    this.db.query(DELETE_BY_ID).run(id);
    return true;
  }

  count(): number {
    const result = this.db.query<{ count: number }, []>(COUNT_SQL).get();
    return result?.count ?? 0;
  }
}