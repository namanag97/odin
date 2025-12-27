/**
 * Zod schemas for actions table
 * Source: 10_automation.sql
 */

import { z } from "zod";

/** Schema for a actions row */
export const ActionsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  rule_id: z.string().uuid(),
  action_type: z.enum(["webhook", "email", "slack", "create_task", "update_attribute", "log"]),
  action_order: z.number().int().nullable(),
  configuration: z.record(z.string(), z.unknown()),
  is_active: z.number().int().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Actions = z.infer<typeof ActionsSchema>;

/** Schema for inserting a actions row */
export const ActionsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  rule_id: z.string().uuid(),
  action_type: z.enum(["webhook", "email", "slack", "create_task", "update_attribute", "log"]),
  action_order: z.number().int().nullable().optional(),
  configuration: z.record(z.string(), z.unknown()),
  is_active: z.number().int().nullable().optional(),
});

export type ActionsInsert = z.infer<typeof ActionsInsertSchema>;

/** Schema for updating a actions row */
export const ActionsUpdateSchema = ActionsInsertSchema.partial();

export type ActionsUpdate = z.infer<typeof ActionsUpdateSchema>;