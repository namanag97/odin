/**
 * Repository for petri_net_places
 * Source: 05_discovery.sql
 */

import { Database } from "bun:sqlite";
import type { PetriNetPlaces, PetriNetPlacesInsert, PetriNetPlacesUpdate } from "../types/petri-net-places";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "petri_net_places";

const SELECT_BY_ID = "SELECT * FROM petri_net_places WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM petri_net_places WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM petri_net_places";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM petri_net_places`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: PetriNetPlacesInsert): { sql: string; params: unknown[] } {
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
  if (data.is_initial !== undefined) {
    columns.push("is_initial");
    values.push(data.is_initial);
    placeholders.push("?");
  }
  if (data.is_final !== undefined) {
    columns.push("is_final");
    values.push(data.is_final);
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

  const sql = `INSERT INTO petri_net_places (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: PetriNetPlacesUpdate): { sql: string; params: unknown[] } {
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
  if (data.is_initial !== undefined) {
    sets.push("is_initial = ?");
    values.push(data.is_initial);
  }
  if (data.is_final !== undefined) {
    sets.push("is_final = ?");
    values.push(data.is_final);
  }
  if (data.position_x !== undefined) {
    sets.push("position_x = ?");
    values.push(data.position_x);
  }
  if (data.position_y !== undefined) {
    sets.push("position_y = ?");
    values.push(data.position_y);
  }

  values.push(id);
  const sql = `UPDATE petri_net_places SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class PetriNetPlacesRepository {
  constructor(private db: Database) {}

  findById(id: string): PetriNetPlaces | null {
    return this.db.query<PetriNetPlaces, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): PetriNetPlaces[] {
    return this.db.query<PetriNetPlaces, []>(buildSelectAll(options)).all();
  }

  create(data: PetriNetPlacesInsert): PetriNetPlaces {
    const { sql, params } = buildInsert(data);
    return this.db.query<PetriNetPlaces, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: PetriNetPlacesUpdate): PetriNetPlaces | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<PetriNetPlaces, unknown[]>(sql).get(...params) ?? null;
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