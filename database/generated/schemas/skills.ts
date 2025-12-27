/**
 * Zod schemas for skills table
 * Source: 18_automation_enhanced.sql
 */

import { z } from "zod";

/** Schema for a skills row */
export const SkillsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  package_id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  sensor_id: z.string().uuid(),
  action_flow_id: z.string().uuid().nullable(),
  status: z.enum(["draft", "active", "inactive"]),
  signal_count: z.number().int().nullable(),
  last_evaluated_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_by: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Skills = z.infer<typeof SkillsSchema>;

/** Schema for inserting a skills row */
export const SkillsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  package_id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  sensor_id: z.string().uuid(),
  action_flow_id: z.string().uuid().nullable().optional(),
  status: z.enum(["draft", "active", "inactive"]).optional(),
  signal_count: z.number().int().nullable().optional(),
  last_evaluated_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  created_by: z.string().nullable().optional(),
});

export type SkillsInsert = z.infer<typeof SkillsInsertSchema>;

/** Schema for updating a skills row */
export const SkillsUpdateSchema = SkillsInsertSchema.partial();

export type SkillsUpdate = z.infer<typeof SkillsUpdateSchema>;