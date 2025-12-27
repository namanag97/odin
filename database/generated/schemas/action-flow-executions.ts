/**
 * Zod schemas for action_flow_executions table
 * Source: 18_automation_enhanced.sql
 */

import { z } from "zod";

/** Schema for a action_flow_executions row */
export const ActionFlowExecutionsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  action_flow_id: z.string().uuid(),
  triggered_by: z.enum(["schedule", "webhook", "manual", "sensor", "api", "on_demand"]),
  triggered_by_user_id: z.string().uuid().nullable(),
  trigger_data: z.record(z.string(), z.unknown()).nullable(),
  status: z.enum(["running", "success", "warning", "error", "cancelled"]),
  started_at: z.string().datetime({ offset: true }).or(z.string()),
  completed_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  duration_ms: z.number().int().nullable(),
  cycles_completed: z.number().int().nullable(),
  bundles_processed: z.number().int().nullable(),
  input_values: z.record(z.string(), z.unknown()).nullable(),
  output_values: z.record(z.string(), z.unknown()).nullable(),
  error_message: z.string().nullable(),
  error_module_id: z.string().uuid().nullable(),
  execution_log: z.array(z.unknown()).nullable(),
  is_data_confidential: z.number().int(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type ActionFlowExecutions = z.infer<typeof ActionFlowExecutionsSchema>;

/** Schema for inserting a action_flow_executions row */
export const ActionFlowExecutionsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  action_flow_id: z.string().uuid(),
  triggered_by: z.enum(["schedule", "webhook", "manual", "sensor", "api", "on_demand"]),
  triggered_by_user_id: z.string().uuid().nullable().optional(),
  trigger_data: z.record(z.string(), z.unknown()).nullable().optional(),
  status: z.enum(["running", "success", "warning", "error", "cancelled"]).optional(),
  started_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
  completed_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  duration_ms: z.number().int().nullable().optional(),
  cycles_completed: z.number().int().nullable().optional(),
  bundles_processed: z.number().int().nullable().optional(),
  input_values: z.record(z.string(), z.unknown()).nullable().optional(),
  output_values: z.record(z.string(), z.unknown()).nullable().optional(),
  error_message: z.string().nullable().optional(),
  error_module_id: z.string().uuid().nullable().optional(),
  execution_log: z.array(z.unknown()).nullable().optional(),
  is_data_confidential: z.number().int().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type ActionFlowExecutionsInsert = z.infer<typeof ActionFlowExecutionsInsertSchema>;

/** Schema for updating a action_flow_executions row */
export const ActionFlowExecutionsUpdateSchema = ActionFlowExecutionsInsertSchema.partial();

export type ActionFlowExecutionsUpdate = z.infer<typeof ActionFlowExecutionsUpdateSchema>;