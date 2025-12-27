/**
 * Repository for petri_nets
 * Source: 05_discovery.sql
 */

import { Database } from "bun:sqlite";
import type { PetriNets, PetriNetsInsert, PetriNetsUpdate } from "../types/petri-nets";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "petri_nets";

const SELECT_BY_ID = "SELECT * FROM petri_nets WHERE id = ? AND tenant_id = ?";
const DELETE_BY_ID = "DELETE FROM petri_nets WHERE id = ? AND tenant_id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM petri_nets WHERE tenant_id = ?";

function buildSelectAll(tenantId: string, options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM petri_nets`;
  sql += " WHERE tenant_id = '" + tenantId + "'";
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: PetriNetsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.discovered_model_id !== undefined) {
    columns.push("discovered_model_id");
    values.push(data.discovered_model_id);
    placeholders.push("?");
  }
  if (data.tenant_id !== undefined) {
    columns.push("tenant_id");
    values.push(data.tenant_id);
    placeholders.push("?");
  }
  if (data.name !== undefined) {
    columns.push("name");
    values.push(data.name);
    placeholders.push("?");
  }
  if (data.initial_marking !== undefined) {
    columns.push("initial_marking");
    values.push(data.initial_marking);
    placeholders.push("?");
  }
  if (data.final_marking !== undefined) {
    columns.push("final_marking");
    values.push(data.final_marking);
    placeholders.push("?");
  }
  if (data.properties !== undefined) {
    columns.push("properties");
    values.push(JSON.stringify(data.properties));
    placeholders.push("?");
  }

  const sql = `INSERT INTO petri_nets (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: PetriNetsUpdate, tenantId: string): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.discovered_model_id !== undefined) {
    sets.push("discovered_model_id = ?");
    values.push(data.discovered_model_id);
  }
  if (data.name !== undefined) {
    sets.push("name = ?");
    values.push(data.name);
  }
  if (data.initial_marking !== undefined) {
    sets.push("initial_marking = ?");
    values.push(data.initial_marking);
  }
  if (data.final_marking !== undefined) {
    sets.push("final_marking = ?");
    values.push(data.final_marking);
  }
  if (data.properties !== undefined) {
    sets.push("properties = ?");
    values.push(JSON.stringify(data.properties));
  }

  values.push(id);
  values.push(tenantId);
  const sql = `UPDATE petri_nets SET ${sets.join(", ")} WHERE id = ? AND tenant_id = ? RETURNING *`;
  return { sql, params: values };
}

export class PetriNetsRepository {
  constructor(private db: Database) {}

  findById(id: string, tenantId: string): PetriNets | null {
    return this.db.query<PetriNets, [string, string]>(SELECT_BY_ID).get(id, tenantId) ?? null;
  }

  findAll(tenantId: string, options: QueryOptions = {}): PetriNets[] {
    return this.db.query<PetriNets, []>(buildSelectAll(tenantId, options)).all();
  }

  create(data: PetriNetsInsert): PetriNets {
    const { sql, params } = buildInsert(data);
    return this.db.query<PetriNets, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: PetriNetsUpdate, tenantId: string): PetriNets | null {
    const { sql, params } = buildUpdate(id, data, tenantId);
    return this.db.query<PetriNets, unknown[]>(sql).get(...params) ?? null;
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