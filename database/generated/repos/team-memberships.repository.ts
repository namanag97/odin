/**
 * Repository for team_memberships
 * Source: 21_identity_layer.sql
 */

import { Database } from "bun:sqlite";
import type { TeamMemberships, TeamMembershipsInsert, TeamMembershipsUpdate } from "../types/team-memberships";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "team_memberships";

const SELECT_BY_ID = "SELECT * FROM team_memberships WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM team_memberships WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM team_memberships";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM team_memberships`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: TeamMembershipsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.team_id !== undefined) {
    columns.push("team_id");
    values.push(data.team_id);
    placeholders.push("?");
  }
  if (data.user_id !== undefined) {
    columns.push("user_id");
    values.push(data.user_id);
    placeholders.push("?");
  }
  if (data.role !== undefined) {
    columns.push("role");
    values.push(data.role);
    placeholders.push("?");
  }
  if (data.joined_at !== undefined) {
    columns.push("joined_at");
    values.push(data.joined_at);
    placeholders.push("?");
  }
  if (data.invited_by !== undefined) {
    columns.push("invited_by");
    values.push(data.invited_by);
    placeholders.push("?");
  }

  const sql = `INSERT INTO team_memberships (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: TeamMembershipsUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.team_id !== undefined) {
    sets.push("team_id = ?");
    values.push(data.team_id);
  }
  if (data.user_id !== undefined) {
    sets.push("user_id = ?");
    values.push(data.user_id);
  }
  if (data.role !== undefined) {
    sets.push("role = ?");
    values.push(data.role);
  }
  if (data.joined_at !== undefined) {
    sets.push("joined_at = ?");
    values.push(data.joined_at);
  }
  if (data.invited_by !== undefined) {
    sets.push("invited_by = ?");
    values.push(data.invited_by);
  }

  values.push(id);
  const sql = `UPDATE team_memberships SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class TeamMembershipsRepository {
  constructor(private db: Database) {}

  findById(id: string): TeamMemberships | null {
    return this.db.query<TeamMemberships, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): TeamMemberships[] {
    return this.db.query<TeamMemberships, []>(buildSelectAll(options)).all();
  }

  create(data: TeamMembershipsInsert): TeamMemberships {
    const { sql, params } = buildInsert(data);
    return this.db.query<TeamMemberships, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: TeamMembershipsUpdate): TeamMemberships | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<TeamMemberships, unknown[]>(sql).get(...params) ?? null;
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