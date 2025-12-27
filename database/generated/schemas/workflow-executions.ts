/**
 * Zod schemas for workflow_executions table
 * Source: 14_workflow_eventsource.sql
 */

import { z } from "zod";

/** Schema for a workflow_executions row */
export const WorkflowExecutionsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  workflow_id: z.string().uuid(),
  run_id: z.string().uuid(),
  workflow_type: z.string(),
  workflow_type_id: z.string().uuid().nullable(),
  parent_execution_id: z.string().uuid().nullable(),
  parent_run_id: z.string().uuid().nullable(),
  status: z.enum(["running", "completed", "failed", "cancelled", "terminated", "timed_out", "continued_as_new"]),
  started_at: z.string().datetime({ offset: true }).or(z.string()),
  completed_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  timeout_seconds: z.number().int().nullable(),
  input: z.string().nullable(),
  output: z.string().nullable(),
  error: z.string().nullable(),
  attempt_number: z.number().int().nullable(),
  max_attempts: z.number().int().nullable(),
  search_attributes: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type WorkflowExecutions = z.infer<typeof WorkflowExecutionsSchema>;

/** Schema for inserting a workflow_executions row */
export const WorkflowExecutionsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  workflow_id: z.string().uuid(),
  run_id: z.string().uuid(),
  workflow_type: z.string(),
  workflow_type_id: z.string().uuid().nullable().optional(),
  parent_execution_id: z.string().uuid().nullable().optional(),
  parent_run_id: z.string().uuid().nullable().optional(),
  status: z.enum(["running", "completed", "failed", "cancelled", "terminated", "timed_out", "continued_as_new"]).optional(),
  started_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
  completed_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  timeout_seconds: z.number().int().nullable().optional(),
  input: z.string().nullable().optional(),
  output: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  attempt_number: z.number().int().nullable().optional(),
  max_attempts: z.number().int().nullable().optional(),
  search_attributes: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type WorkflowExecutionsInsert = z.infer<typeof WorkflowExecutionsInsertSchema>;

/** Schema for updating a workflow_executions row */
export const WorkflowExecutionsUpdateSchema = WorkflowExecutionsInsertSchema.partial();

export type WorkflowExecutionsUpdate = z.infer<typeof WorkflowExecutionsUpdateSchema>;