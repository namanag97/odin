/**
 * Zod schemas for task_types table
 * Source: 18_automation_enhanced.sql
 */

import { z } from "zod";

/** Schema for a task_types row */
export const TaskTypesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  default_priority: z.string().nullable(),
  attribute_schema: z.record(z.string(), z.unknown()).nullable(),
  workflow_config: z.record(z.string(), z.unknown()).nullable(),
  sla_config: z.record(z.string(), z.unknown()).nullable(),
  is_system: z.number().int(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type TaskTypes = z.infer<typeof TaskTypesSchema>;

/** Schema for inserting a task_types row */
export const TaskTypesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  default_priority: z.string().nullable().optional(),
  attribute_schema: z.record(z.string(), z.unknown()).nullable().optional(),
  workflow_config: z.record(z.string(), z.unknown()).nullable().optional(),
  sla_config: z.record(z.string(), z.unknown()).nullable().optional(),
  is_system: z.number().int().optional(),
});

export type TaskTypesInsert = z.infer<typeof TaskTypesInsertSchema>;

/** Schema for updating a task_types row */
export const TaskTypesUpdateSchema = TaskTypesInsertSchema.partial();

export type TaskTypesUpdate = z.infer<typeof TaskTypesUpdateSchema>;