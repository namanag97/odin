/**
 * Repository for entity_history
 * Source: 24_temporal_layer.sql
 */

import { Database } from "bun:sqlite";
import type { EntityHistory, EntityHistoryInsert, EntityHistoryUpdate } from "../types/entity-history";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "entity_history";

const SELECT_BY_ID = "SELECT * FROM entity_history WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM entity_history WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM entity_history";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM entity_history`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: EntityHistoryInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.entity_type !== undefined) {
    columns.push("entity_type");
    values.push(data.entity_type);
    placeholders.push("?");
  }
  if (data.entity_id !== undefined) {
    columns.push("entity_id");
    values.push(data.entity_id);
    placeholders.push("?");
  }
  if (data.version !== undefined) {
    columns.push("version");
    values.push(data.version);
    placeholders.push("?");
  }
  if (data.operation !== undefined) {
    columns.push("operation");
    values.push(data.operation);
    placeholders.push("?");
  }
  if (data.data_before !== undefined) {
    columns.push("data_before");
    values.push(data.data_before);
    placeholders.push("?");
  }
  if (data.data_after !== undefined) {
    columns.push("data_after");
    values.push(data.data_after);
    placeholders.push("?");
  }
  if (data.changed_fields !== undefined) {
    columns.push("changed_fields");
    values.push(data.changed_fields);
    placeholders.push("?");
  }
  if (data.changed_by !== undefined) {
    columns.push("changed_by");
    values.push(data.changed_by);
    placeholders.push("?");
  }
  if (data.changed_at !== undefined) {
    columns.push("changed_at");
    values.push(data.changed_at);
    placeholders.push("?");
  }

  const sql = `INSERT INTO entity_history (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: EntityHistoryUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.entity_type !== undefined) {
    sets.push("entity_type = ?");
    values.push(data.entity_type);
  }
  if (data.entity_id !== undefined) {
    sets.push("entity_id = ?");
    values.push(data.entity_id);
  }
  if (data.version !== undefined) {
    sets.push("version = ?");
    values.push(data.version);
  }
  if (data.operation !== undefined) {
    sets.push("operation = ?");
    values.push(data.operation);
  }
  if (data.data_before !== undefined) {
    sets.push("data_before = ?");
    values.push(data.data_before);
  }
  if (data.data_after !== undefined) {
    sets.push("data_after = ?");
    values.push(data.data_after);
  }
  if (data.changed_fields !== undefined) {
    sets.push("changed_fields = ?");
    values.push(data.changed_fields);
  }
  if (data.changed_by !== undefined) {
    sets.push("changed_by = ?");
    values.push(data.changed_by);
  }
  if (data.changed_at !== undefined) {
    sets.push("changed_at = ?");
    values.push(data.changed_at);
  }

  values.push(id);
  const sql = `UPDATE entity_history SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class EntityHistoryRepository {
  constructor(private db: Database) {}

  findById(id: string): EntityHistory | null {
    return this.db.query<EntityHistory, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): EntityHistory[] {
    return this.db.query<EntityHistory, []>(buildSelectAll(options)).all();
  }

  create(data: EntityHistoryInsert): EntityHistory {
    const { sql, params } = buildInsert(data);
    return this.db.query<EntityHistory, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: EntityHistoryUpdate): EntityHistory | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<EntityHistory, unknown[]>(sql).get(...params) ?? null;
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