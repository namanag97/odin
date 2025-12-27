/**
 * Repository for petri_net_transitions
 * Source: 05_discovery.sql
 */

import { Database } from "bun:sqlite";
import type { PetriNetTransitions, PetriNetTransitionsInsert, PetriNetTransitionsUpdate } from "../types/petri-net-transitions";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "petri_net_transitions";

const SELECT_BY_ID = "SELECT * FROM petri_net_transitions WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM petri_net_transitions WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM petri_net_transitions";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM petri_net_transitions`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: PetriNetTransitionsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.petri_net_id !== undefined) {
    columns.push("petri_net_id");
    values.push(data.petri_net_id);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.label !== undefined) {
    columns.push("label");
    values.push(data.label);
    placeholders.push("?");
  }
  if (data.is_silent !== undefined) {
    columns.push("is_silent");
    values.push(data.is_silent);
    placeholders.push("?");
  }
  if (data.activity_id !== undefined) {
    columns.push("activity_id");
    values.push(data.activity_id);
    placeholders.push("?");
  }
  if (data.position_x !== undefined) {
    columns.push("position_x");
    values.push(data.position_x);
    placeholders.push("?");
  }
  if (data.position_y !== undefined) {
    columns.push("position_y");
    values.push(data.position_y);
    placeholders.push("?");
  }
  if (data.frequency !== undefined) {
    columns.push("frequency");
    values.push(data.frequency);
    placeholders.push("?");
  }

  const sql = `INSERT INTO petri_net_transitions (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: PetriNetTransitionsUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.petri_net_id !== undefined) {
    sets.push("petri_net_id = ?");
    values.push(data.petri_net_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.label !== undefined) {
    sets.push("label = ?");
    values.push(data.label);
  }
  if (data.is_silent !== undefined) {
    sets.push("is_silent = ?");
    values.push(data.is_silent);
  }
  if (data.activity_id !== undefined) {
    sets.push("activity_id = ?");
    values.push(data.activity_id);
  }
  if (data.position_x !== undefined) {
    sets.push("position_x = ?");
    values.push(data.position_x);
  }
  if (data.position_y !== undefined) {
    sets.push("position_y = ?");
    values.push(data.position_y);
  }
  if (data.frequency !== undefined) {
    sets.push("frequency = ?");
    values.push(data.frequency);
  }

  values.push(id);
  const sql = `UPDATE petri_net_transitions SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class PetriNetTransitionsRepository {
  constructor(private db: Database) {}

  findById(id: string): PetriNetTransitions | null {
    return this.db.query<PetriNetTransitions, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): PetriNetTransitions[] {
    return this.db.query<PetriNetTransitions, []>(buildSelectAll(options)).all();
  }

  create(data: PetriNetTransitionsInsert): PetriNetTransitions {
    const { sql, params } = buildInsert(data);
    return this.db.query<PetriNetTransitions, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: PetriNetTransitionsUpdate): PetriNetTransitions | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<PetriNetTransitions, unknown[]>(sql).get(...params) ?? null;
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