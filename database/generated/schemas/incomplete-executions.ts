/**
 * Zod schemas for incomplete_executions table
 * Source: 18_automation_enhanced.sql
 */

import { z } from "zod";

/** Schema for a incomplete_executions row */
export const IncompleteExecutionsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  action_flow_id: z.string().uuid(),
  execution_id: z.string().uuid(),
  failed_module_id: z.string().uuid(),
  error_message: z.string(),
  error_type: z.string(),
  bundle_data: z.string(),
  remaining_flow: z.string(),
  retry_count: z.number().int().nullable(),
  max_retries: z.number().int().nullable(),
  next_retry_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  retry_delay_seconds: z.number().int().nullable(),
  status: z.enum(["pending", "retrying", "resolved", "abandoned"]),
  resolved_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  resolved_by: z.string().nullable(),
  resolution_type: z.enum(["retry_success", "manual_resolve", "deleted"]).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type IncompleteExecutions = z.infer<typeof IncompleteExecutionsSchema>;

/** Schema for inserting a incomplete_executions row */
export const IncompleteExecutionsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  action_flow_id: z.string().uuid(),
  execution_id: z.string().uuid(),
  failed_module_id: z.string().uuid(),
  error_message: z.string(),
  error_type: z.string(),
  bundle_data: z.string(),
  remaining_flow: z.string(),
  retry_count: z.number().int().nullable().optional(),
  max_retries: z.number().int().nullable().optional(),
  next_retry_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  retry_delay_seconds: z.number().int().nullable().optional(),
  status: z.enum(["pending", "retrying", "resolved", "abandoned"]).optional(),
  resolved_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  resolved_by: z.string().nullable().optional(),
  resolution_type: z.enum(["retry_success", "manual_resolve", "deleted"]).nullable().optional(),
});

export type IncompleteExecutionsInsert = z.infer<typeof IncompleteExecutionsInsertSchema>;

/** Schema for updating a incomplete_executions row */
export const IncompleteExecutionsUpdateSchema = IncompleteExecutionsInsertSchema.partial();

export type IncompleteExecutionsUpdate = z.infer<typeof IncompleteExecutionsUpdateSchema>;