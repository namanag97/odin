/**
 * Zod schemas for workflow_activities table
 * Source: 14_workflow_eventsource.sql
 */

import { z } from "zod";

/** Schema for a workflow_activities row */
export const WorkflowActivitiesSchema = z.object({
  id: z.string().uuid(),
  execution_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  activity_id: z.string().uuid(),
  activity_type: z.string(),
  scheduled_event_id: z.string().uuid(),
  started_event_id: z.string().uuid().nullable(),
  completed_event_id: z.string().uuid().nullable(),
  status: z.enum(["scheduled", "running", "completed", "failed", "cancelled", "timed_out"]),
  scheduled_at: z.string().datetime({ offset: true }).or(z.string()),
  started_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  completed_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  attempt_number: z.number().int().nullable(),
  max_attempts: z.number().int().nullable(),
  input: z.string().nullable(),
  output: z.string().nullable(),
  error: z.string().nullable(),
  task_queue: z.string().nullable(),
});

export type WorkflowActivities = z.infer<typeof WorkflowActivitiesSchema>;

/** Schema for inserting a workflow_activities row */
export const WorkflowActivitiesInsertSchema = z.object({
  execution_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  activity_id: z.string().uuid(),
  activity_type: z.string(),
  scheduled_event_id: z.string().uuid(),
  started_event_id: z.string().uuid().nullable().optional(),
  completed_event_id: z.string().uuid().nullable().optional(),
  status: z.enum(["scheduled", "running", "completed", "failed", "cancelled", "timed_out"]).optional(),
  scheduled_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
  started_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  completed_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  attempt_number: z.number().int().nullable().optional(),
  max_attempts: z.number().int().nullable().optional(),
  input: z.string().nullable().optional(),
  output: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  task_queue: z.string().nullable().optional(),
});

export type WorkflowActivitiesInsert = z.infer<typeof WorkflowActivitiesInsertSchema>;

/** Schema for updating a workflow_activities row */
export const WorkflowActivitiesUpdateSchema = WorkflowActivitiesInsertSchema.partial();

export type WorkflowActivitiesUpdate = z.infer<typeof WorkflowActivitiesUpdateSchema>;