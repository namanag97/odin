/**
 * Zod schemas for action_rules table
 * Source: 10_automation.sql
 */

import { z } from "zod";

/** Schema for a action_rules row */
export const ActionRulesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  event_log_id: z.string().uuid().nullable(),
  data_pool_id: z.string().uuid().nullable(),
  rule_type: z.enum(["pattern", "threshold", "anomaly", "schedule", "new_case", "case_completed"]),
  condition: z.string(),
  is_active: z.number().int().nullable(),
  cooldown_seconds: z.number().int().nullable(),
  last_triggered_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  trigger_count: z.number().int().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type ActionRules = z.infer<typeof ActionRulesSchema>;

/** Schema for inserting a action_rules row */
export const ActionRulesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  event_log_id: z.string().uuid().nullable().optional(),
  data_pool_id: z.string().uuid().nullable().optional(),
  rule_type: z.enum(["pattern", "threshold", "anomaly", "schedule", "new_case", "case_completed"]),
  condition: z.string(),
  is_active: z.number().int().nullable().optional(),
  cooldown_seconds: z.number().int().nullable().optional(),
  last_triggered_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  trigger_count: z.number().int().nullable().optional(),
});

export type ActionRulesInsert = z.infer<typeof ActionRulesInsertSchema>;

/** Schema for updating a action_rules row */
export const ActionRulesUpdateSchema = ActionRulesInsertSchema.partial();

export type ActionRulesUpdate = z.infer<typeof ActionRulesUpdateSchema>;