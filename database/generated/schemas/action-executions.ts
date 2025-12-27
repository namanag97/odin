/**
 * Zod schemas for action_executions table
 * Source: 10_automation.sql
 */

import { z } from "zod";

/** Schema for a action_executions row */
export const ActionExecutionsSchema = z.object({
  id: z.string().uuid(),
  action_id: z.string().uuid(),
  rule_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  triggered_at: z.string().datetime({ offset: true }).or(z.string()),
  trigger_context: z.string(),
  status: z.enum(["success", "failed", "pending", "skipped"]),
  response: z.string().nullable(),
  error_message: z.string().nullable(),
  execution_time_ms: z.number().int().nullable(),
});

export type ActionExecutions = z.infer<typeof ActionExecutionsSchema>;

/** Schema for inserting a action_executions row */
export const ActionExecutionsInsertSchema = z.object({
  action_id: z.string().uuid(),
  rule_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  triggered_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
  trigger_context: z.string(),
  status: z.enum(["success", "failed", "pending", "skipped"]),
  response: z.string().nullable().optional(),
  error_message: z.string().nullable().optional(),
  execution_time_ms: z.number().int().nullable().optional(),
});

export type ActionExecutionsInsert = z.infer<typeof ActionExecutionsInsertSchema>;

/** Schema for updating a action_executions row */
export const ActionExecutionsUpdateSchema = ActionExecutionsInsertSchema.partial();

export type ActionExecutionsUpdate = z.infer<typeof ActionExecutionsUpdateSchema>;