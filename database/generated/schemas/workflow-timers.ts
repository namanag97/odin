/**
 * Zod schemas for workflow_timers table
 * Source: 14_workflow_eventsource.sql
 */

import { z } from "zod";

/** Schema for a workflow_timers row */
export const WorkflowTimersSchema = z.object({
  id: z.string().uuid(),
  execution_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  timer_id: z.string().uuid(),
  fire_at: z.string().datetime({ offset: true }).or(z.string()),
  duration_seconds: z.number().int().nullable(),
  status: z.enum(["pending", "fired", "cancelled"]).nullable(),
  started_event_id: z.string().uuid(),
  fired_event_id: z.string().uuid().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type WorkflowTimers = z.infer<typeof WorkflowTimersSchema>;

/** Schema for inserting a workflow_timers row */
export const WorkflowTimersInsertSchema = z.object({
  execution_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  timer_id: z.string().uuid(),
  fire_at: z.string().datetime({ offset: true }).or(z.string()),
  duration_seconds: z.number().int().nullable().optional(),
  status: z.enum(["pending", "fired", "cancelled"]).nullable().optional(),
  started_event_id: z.string().uuid(),
  fired_event_id: z.string().uuid().nullable().optional(),
});

export type WorkflowTimersInsert = z.infer<typeof WorkflowTimersInsertSchema>;

/** Schema for updating a workflow_timers row */
export const WorkflowTimersUpdateSchema = WorkflowTimersInsertSchema.partial();

export type WorkflowTimersUpdate = z.infer<typeof WorkflowTimersUpdateSchema>;