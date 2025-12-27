/**
 * Repository for user_profiles
 * Source: 21_identity_layer.sql
 */

import { Database } from "bun:sqlite";
import type { UserProfiles, UserProfilesInsert, UserProfilesUpdate } from "../types/user-profiles";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "user_profiles";

const SELECT_BY_ID = "SELECT * FROM user_profiles WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM user_profiles WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM user_profiles";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM user_profiles`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: UserProfilesInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.user_id !== undefined) {
    columns.push("user_id");
    values.push(data.user_id);
    placeholders.push("?");
  }
  if (data.first_name !== undefined) {
    columns.push("first_name");
    values.push(data.first_name);
    placeholders.push("?");
  }
  if (data.last_name !== undefined) {
    columns.push("last_name");
    values.push(data.last_name);
    placeholders.push("?");
  }
  if (data.display_name !== undefined) {
    columns.push("display_name");
    values.push(data.display_name);
    placeholders.push("?");
  }
  if (data.avatar_url !== undefined) {
    columns.push("avatar_url");
    values.push(data.avatar_url);
    placeholders.push("?");
  }
  if (data.timezone !== undefined) {
    columns.push("timezone");
    values.push(data.timezone);
    placeholders.push("?");
  }
  if (data.locale !== undefined) {
    columns.push("locale");
    values.push(data.locale);
    placeholders.push("?");
  }
  if (data.bio !== undefined) {
    columns.push("bio");
    values.push(data.bio);
    placeholders.push("?");
  }
  if (data.job_title !== undefined) {
    columns.push("job_title");
    values.push(data.job_title);
    placeholders.push("?");
  }
  if (data.department !== undefined) {
    columns.push("department");
    values.push(data.department);
    placeholders.push("?");
  }
  if (data.custom_fields !== undefined) {
    columns.push("custom_fields");
    values.push(JSON.stringify(data.custom_fields));
    placeholders.push("?");
  }

  const sql = `INSERT INTO user_profiles (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: UserProfilesUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.user_id !== undefined) {
    sets.push("user_id = ?");
    values.push(data.user_id);
  }
  if (data.first_name !== undefined) {
    sets.push("first_name = ?");
    values.push(data.first_name);
  }
  if (data.last_name !== undefined) {
    sets.push("last_name = ?");
    values.push(data.last_name);
  }
  if (data.display_name !== undefined) {
    sets.push("display_name = ?");
    values.push(data.display_name);
  }
  if (data.avatar_url !== undefined) {
    sets.push("avatar_url = ?");
    values.push(data.avatar_url);
  }
  if (data.timezone !== undefined) {
    sets.push("timezone = ?");
    values.push(data.timezone);
  }
  if (data.locale !== undefined) {
    sets.push("locale = ?");
    values.push(data.locale);
  }
  if (data.bio !== undefined) {
    sets.push("bio = ?");
    values.push(data.bio);
  }
  if (data.job_title !== undefined) {
    sets.push("job_title = ?");
    values.push(data.job_title);
  }
  if (data.department !== undefined) {
    sets.push("department = ?");
    values.push(data.department);
  }
  if (data.custom_fields !== undefined) {
    sets.push("custom_fields = ?");
    values.push(JSON.stringify(data.custom_fields));
  }

  values.push(id);
  const sql = `UPDATE user_profiles SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class UserProfilesRepository {
  constructor(private db: Database) {}

  findById(id: string): UserProfiles | null {
    return this.db.query<UserProfiles, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): UserProfiles[] {
    return this.db.query<UserProfiles, []>(buildSelectAll(options)).all();
  }

  create(data: UserProfilesInsert): UserProfiles {
    const { sql, params } = buildInsert(data);
    return this.db.query<UserProfiles, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: UserProfilesUpdate): UserProfiles | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<UserProfiles, unknown[]>(sql).get(...params) ?? null;
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