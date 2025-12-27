/**
 * Zod schemas for workflow_steps table
 * Source: 10_automation.sql
 */

import { z } from "zod";

/** Schema for a workflow_steps row */
export const WorkflowStepsSchema = z.object({
  id: z.string().uuid(),
  workflow_id: z.string().uuid(),
  step_order: z.number().int(),
  step_type: z.enum(["action", "condition", "wait", "parallel", "loop"]),
  configuration: z.record(z.string(), z.unknown()),
  on_success_step_id: z.string().uuid().nullable(),
  on_failure_step_id: z.string().uuid().nullable(),
  timeout_seconds: z.number().int().nullable(),
});

export type WorkflowSteps = z.infer<typeof WorkflowStepsSchema>;

/** Schema for inserting a workflow_steps row */
export const WorkflowStepsInsertSchema = z.object({
  workflow_id: z.string().uuid(),
  step_order: z.number().int(),
  step_type: z.enum(["action", "condition", "wait", "parallel", "loop"]),
  configuration: z.record(z.string(), z.unknown()),
  on_success_step_id: z.string().uuid().nullable().optional(),
  on_failure_step_id: z.string().uuid().nullable().optional(),
  timeout_seconds: z.number().int().nullable().optional(),
});

export type WorkflowStepsInsert = z.infer<typeof WorkflowStepsInsertSchema>;

/** Schema for updating a workflow_steps row */
export const WorkflowStepsUpdateSchema = WorkflowStepsInsertSchema.partial();

export type WorkflowStepsUpdate = z.infer<typeof WorkflowStepsUpdateSchema>;