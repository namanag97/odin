/**
 * Zod schemas for action_flow_modules table
 * Source: 18_automation_enhanced.sql
 */

import { z } from "zod";

/** Schema for a action_flow_modules row */
export const ActionFlowModulesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  action_flow_id: z.string().uuid(),
  parent_module_id: z.string().uuid().nullable(),
  module_type: z.enum(["trigger", "action", "transformer", "aggregator", "router", "error_handler", "iterator", "repeater"]),
  app_name: z.string(),
  action_name: z.string(),
  connection_id: z.string().uuid().nullable(),
  position: z.number().int(),
  configuration: z.record(z.string(), z.unknown()),
  input_mapping: z.record(z.string(), z.unknown()).nullable(),
  output_mapping: z.record(z.string(), z.unknown()).nullable(),
  error_handler_type: z.enum(["break", "resume", "rollback", "ignore", "commit"]).nullable(),
  is_acid: z.number().int(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type ActionFlowModules = z.infer<typeof ActionFlowModulesSchema>;

/** Schema for inserting a action_flow_modules row */
export const ActionFlowModulesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  action_flow_id: z.string().uuid(),
  parent_module_id: z.string().uuid().nullable().optional(),
  module_type: z.enum(["trigger", "action", "transformer", "aggregator", "router", "error_handler", "iterator", "repeater"]),
  app_name: z.string(),
  action_name: z.string(),
  connection_id: z.string().uuid().nullable().optional(),
  position: z.number().int(),
  configuration: z.record(z.string(), z.unknown()),
  input_mapping: z.record(z.string(), z.unknown()).nullable().optional(),
  output_mapping: z.record(z.string(), z.unknown()).nullable().optional(),
  error_handler_type: z.enum(["break", "resume", "rollback", "ignore", "commit"]).nullable().optional(),
  is_acid: z.number().int().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type ActionFlowModulesInsert = z.infer<typeof ActionFlowModulesInsertSchema>;

/** Schema for updating a action_flow_modules row */
export const ActionFlowModulesUpdateSchema = ActionFlowModulesInsertSchema.partial();

export type ActionFlowModulesUpdate = z.infer<typeof ActionFlowModulesUpdateSchema>;