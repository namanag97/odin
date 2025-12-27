/**
 * Zod schemas for workflows table
 * Source: 10_automation.sql
 */

import { z } from "zod";

/** Schema for a workflows row */
export const WorkflowsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  trigger_type: z.enum(["rule", "schedule", "manual", "api"]),
  trigger_config: z.record(z.string(), z.unknown()).nullable(),
  is_active: z.number().int().nullable(),
  timeout_seconds: z.number().int().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Workflows = z.infer<typeof WorkflowsSchema>;

/** Schema for inserting a workflows row */
export const WorkflowsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  trigger_type: z.enum(["rule", "schedule", "manual", "api"]),
  trigger_config: z.record(z.string(), z.unknown()).nullable().optional(),
  is_active: z.number().int().nullable().optional(),
  timeout_seconds: z.number().int().nullable().optional(),
});

export type WorkflowsInsert = z.infer<typeof WorkflowsInsertSchema>;

/** Schema for updating a workflows row */
export const WorkflowsUpdateSchema = WorkflowsInsertSchema.partial();

export type WorkflowsUpdate = z.infer<typeof WorkflowsUpdateSchema>;