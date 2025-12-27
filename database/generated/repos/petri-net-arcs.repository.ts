/**
 * Repository for petri_net_arcs
 * Source: 05_discovery.sql
 */

import { Database } from "bun:sqlite";
import type { PetriNetArcs, PetriNetArcsInsert, PetriNetArcsUpdate } from "../types/petri-net-arcs";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "petri_net_arcs";

const SELECT_BY_ID = "SELECT * FROM petri_net_arcs WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM petri_net_arcs WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM petri_net_arcs";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM petri_net_arcs`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: PetriNetArcsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.petri_net_id !== undefined) {
    columns.push("petri_net_id");
    values.push(data.petri_net_id);
    placeholders.push("?");
  }
  if (data.source_place_id !== undefined) {
    columns.push("source_place_id");
    values.push(data.source_place_id);
    placeholders.push("?");
  }
  if (data.source_transition_id !== undefined) {
    columns.push("source_transition_id");
    values.push(data.source_transition_id);
    placeholders.push("?");
  }
  if (data.target_place_id !== undefined) {
    columns.push("target_place_id");
    values.push(data.target_place_id);
    placeholders.push("?");
  }
  if (data.target_transition_id !== undefined) {
    columns.push("target_transition_id");
    values.push(data.target_transition_id);
    placeholders.push("?");
  }
  if (data.weight !== undefined) {
    columns.push("weight");
    values.push(data.weight);
    placeholders.push("?");
  }

  const sql = `INSERT INTO petri_net_arcs (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: PetriNetArcsUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.petri_net_id !== undefined) {
    sets.push("petri_net_id = ?");
    values.push(data.petri_net_id);
  }
  if (data.source_place_id !== undefined) {
    sets.push("source_place_id = ?");
    values.push(data.source_place_id);
  }
  if (data.source_transition_id !== undefined) {
    sets.push("source_transition_id = ?");
    values.push(data.source_transition_id);
  }
  if (data.target_place_id !== undefined) {
    sets.push("target_place_id = ?");
    values.push(data.target_place_id);
  }
  if (data.target_transition_id !== undefined) {
    sets.push("target_transition_id = ?");
    values.push(data.target_transition_id);
  }
  if (data.weight !== undefined) {
    sets.push("weight = ?");
    values.push(data.weight);
  }

  values.push(id);
  const sql = `UPDATE petri_net_arcs SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class PetriNetArcsRepository {
  constructor(private db: Database) {}

  findById(id: string): PetriNetArcs | null {
    return this.db.query<PetriNetArcs, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): PetriNetArcs[] {
    return this.db.query<PetriNetArcs, []>(buildSelectAll(options)).all();
  }

  create(data: PetriNetArcsInsert): PetriNetArcs {
    const { sql, params } = buildInsert(data);
    return this.db.query<PetriNetArcs, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: PetriNetArcsUpdate): PetriNetArcs | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<PetriNetArcs, unknown[]>(sql).get(...params) ?? null;
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