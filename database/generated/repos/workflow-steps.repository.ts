/**
 * Repository for workflow_steps
 * Source: 10_automation.sql
 */

import { Database } from "bun:sqlite";
import type { WorkflowSteps, WorkflowStepsInsert, WorkflowStepsUpdate } from "../types/workflow-steps";
import type { QueryOptions } from "./base-repository";

// SQL Queries
const TABLE_NAME = "workflow_steps";

const SELECT_BY_ID = "SELECT * FROM workflow_steps WHERE id = ?";
const DELETE_BY_ID = "DELETE FROM workflow_steps WHERE id = ?";
const COUNT_SQL = "SELECT COUNT(*) as count FROM workflow_steps";

function buildSelectAll(options: QueryOptions = {}): string {
  const { limit, offset, orderBy = "created_at", orderDir = "desc" } = options;
  let sql = `SELECT * FROM workflow_steps`;
  if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
  if (limit) sql += ` LIMIT ${limit}`;
  if (offset) sql += ` OFFSET ${offset}`;
  return sql;
}

function buildInsert(data: WorkflowStepsInsert): { sql: string; params: unknown[] } {
  const columns: string[] = ["id", "created_at", "updated_at"];
  const values: unknown[] = [crypto.randomUUID(), new Date().toISOString(), new Date().toISOString()];
  const placeholders: string[] = ["?", "?", "?"];

  if (data.workflow_id !== undefined) {
    columns.push("workflow_id");
    values.push(data.workflow_id);
    placeholders.push("?");
  }
  if (data.step_order !== undefined) {
    columns.push("step_order");
    values.push(data.step_order);
    placeholders.push("?");
  }
  if (data.step_type !== undefined) {
    columns.push("step_type");
    values.push(data.step_type);
    placeholders.push("?");
  }
  if (data.configuration !== undefined) {
    columns.push("configuration");
    values.push(JSON.stringify(data.configuration));
    placeholders.push("?");
  }
  if (data.on_success_step_id !== undefined) {
    columns.push("on_success_step_id");
    values.push(data.on_success_step_id);
    placeholders.push("?");
  }
  if (data.on_failure_step_id !== undefined) {
    columns.push("on_failure_step_id");
    values.push(data.on_failure_step_id);
    placeholders.push("?");
  }
  if (data.timeout_seconds !== undefined) {
    columns.push("timeout_seconds");
    values.push(data.timeout_seconds);
    placeholders.push("?");
  }

  const sql = `INSERT INTO workflow_steps (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  return { sql, params: values };
}

function buildUpdate(id: string, data: WorkflowStepsUpdate): { sql: string; params: unknown[] } {
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [new Date().toISOString()];

  if (data.workflow_id !== undefined) {
    sets.push("workflow_id = ?");
    values.push(data.workflow_id);
  }
  if (data.step_order !== undefined) {
    sets.push("step_order = ?");
    values.push(data.step_order);
  }
  if (data.step_type !== undefined) {
    sets.push("step_type = ?");
    values.push(data.step_type);
  }
  if (data.configuration !== undefined) {
    sets.push("configuration = ?");
    values.push(JSON.stringify(data.configuration));
  }
  if (data.on_success_step_id !== undefined) {
    sets.push("on_success_step_id = ?");
    values.push(data.on_success_step_id);
  }
  if (data.on_failure_step_id !== undefined) {
    sets.push("on_failure_step_id = ?");
    values.push(data.on_failure_step_id);
  }
  if (data.timeout_seconds !== undefined) {
    sets.push("timeout_seconds = ?");
    values.push(data.timeout_seconds);
  }

  values.push(id);
  const sql = `UPDATE workflow_steps SET ${sets.join(", ")} WHERE id = ? RETURNING *`;
  return { sql, params: values };
}

export class WorkflowStepsRepository {
  constructor(private db: Database) {}

  findById(id: string): WorkflowSteps | null {
    return this.db.query<WorkflowSteps, [string]>(SELECT_BY_ID).get(id) ?? null;
  }

  findAll(options: QueryOptions = {}): WorkflowSteps[] {
    return this.db.query<WorkflowSteps, []>(buildSelectAll(options)).all();
  }

  create(data: WorkflowStepsInsert): WorkflowSteps {
    const { sql, params } = buildInsert(data);
    return this.db.query<WorkflowSteps, unknown[]>(sql).get(...params)!;
  }

  update(id: string, data: WorkflowStepsUpdate): WorkflowSteps | null {
    const { sql, params } = buildUpdate(id, data);
    return this.db.query<WorkflowSteps, unknown[]>(sql).get(...params) ?? null;
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