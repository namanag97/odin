/**
 * Zod schemas for workflow_signals table
 * Source: 14_workflow_eventsource.sql
 */

import { z } from "zod";

/** Schema for a workflow_signals row */
export const WorkflowSignalsSchema = z.object({
  id: z.string().uuid(),
  execution_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  signal_name: z.string(),
  signal_input: z.string().nullable(),
  source_type: z.string().nullable(),
  source_id: z.string().uuid().nullable(),
  received_at: z.string().datetime({ offset: true }).or(z.string()),
  processed_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
});

export type WorkflowSignals = z.infer<typeof WorkflowSignalsSchema>;

/** Schema for inserting a workflow_signals row */
export const WorkflowSignalsInsertSchema = z.object({
  execution_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  signal_name: z.string(),
  signal_input: z.string().nullable().optional(),
  source_type: z.string().nullable().optional(),
  source_id: z.string().uuid().nullable().optional(),
  received_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
  processed_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
});

export type WorkflowSignalsInsert = z.infer<typeof WorkflowSignalsInsertSchema>;

/** Schema for updating a workflow_signals row */
export const WorkflowSignalsUpdateSchema = WorkflowSignalsInsertSchema.partial();

export type WorkflowSignalsUpdate = z.infer<typeof WorkflowSignalsUpdateSchema>;