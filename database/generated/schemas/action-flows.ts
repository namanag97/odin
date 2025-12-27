/**
 * Zod schemas for action_flows table
 * Source: 18_automation_enhanced.sql
 */

import { z } from "zod";

/** Schema for a action_flows row */
export const ActionFlowsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  package_id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  trigger_type: z.enum(["manual", "scheduled", "event", "webhook", "sensor"]),
  schedule_id: z.string().uuid().nullable(),
  webhook_id: z.string().uuid().nullable(),
  sensor_id: z.string().uuid().nullable(),
  status: z.enum(["draft", "active", "inactive", "deactivated"]),
  consecutive_error_limit: z.number().int().nullable(),
  consecutive_error_count: z.number().int().nullable(),
  is_data_confidential: z.number().int(),
  timeout_seconds: z.number().int().nullable(),
  max_cycles: z.number().int().nullable(),
  auto_commit: z.number().int(),
  sequential_processing: z.number().int(),
  incomplete_executions_enabled: z.number().int(),
  blueprint: z.string(),
  inputs: z.array(z.unknown()).nullable(),
  outputs: z.array(z.unknown()).nullable(),
  last_executed_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  last_execution_status: z.enum(["success", "warning", "error"]).nullable(),
  activated_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  deactivated_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  deactivation_reason: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_by: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type ActionFlows = z.infer<typeof ActionFlowsSchema>;

/** Schema for inserting a action_flows row */
export const ActionFlowsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  package_id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  trigger_type: z.enum(["manual", "scheduled", "event", "webhook", "sensor"]),
  schedule_id: z.string().uuid().nullable().optional(),
  webhook_id: z.string().uuid().nullable().optional(),
  sensor_id: z.string().uuid().nullable().optional(),
  status: z.enum(["draft", "active", "inactive", "deactivated"]).optional(),
  consecutive_error_limit: z.number().int().nullable().optional(),
  consecutive_error_count: z.number().int().nullable().optional(),
  is_data_confidential: z.number().int().optional(),
  timeout_seconds: z.number().int().nullable().optional(),
  max_cycles: z.number().int().nullable().optional(),
  auto_commit: z.number().int().optional(),
  sequential_processing: z.number().int().optional(),
  incomplete_executions_enabled: z.number().int().optional(),
  blueprint: z.string(),
  inputs: z.array(z.unknown()).nullable().optional(),
  outputs: z.array(z.unknown()).nullable().optional(),
  last_executed_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  last_execution_status: z.enum(["success", "warning", "error"]).nullable().optional(),
  activated_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  deactivated_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  deactivation_reason: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  created_by: z.string().nullable().optional(),
});

export type ActionFlowsInsert = z.infer<typeof ActionFlowsInsertSchema>;

/** Schema for updating a action_flows row */
export const ActionFlowsUpdateSchema = ActionFlowsInsertSchema.partial();

export type ActionFlowsUpdate = z.infer<typeof ActionFlowsUpdateSchema>;