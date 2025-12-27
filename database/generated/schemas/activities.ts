/**
 * Zod schemas for activities table
 * Source: 02_case_centric.sql
 */

import { z } from "zod";

/** Schema for a activities row */
export const ActivitiesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid(),
  name: z.string(),
  display_name: z.string().nullable(),
  category: z.string().nullable(),
  is_automated: z.number().int().nullable(),
  avg_duration_seconds: z.number().int().nullable(),
  avg_cost: z.number().nullable(),
  occurrence_count: z.number().int().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Activities = z.infer<typeof ActivitiesSchema>;

/** Schema for inserting a activities row */
export const ActivitiesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid(),
  name: z.string(),
  display_name: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  is_automated: z.number().int().nullable().optional(),
  avg_duration_seconds: z.number().int().nullable().optional(),
  avg_cost: z.number().nullable().optional(),
  occurrence_count: z.number().int().nullable().optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type ActivitiesInsert = z.infer<typeof ActivitiesInsertSchema>;

/** Schema for updating a activities row */
export const ActivitiesUpdateSchema = ActivitiesInsertSchema.partial();

export type ActivitiesUpdate = z.infer<typeof ActivitiesUpdateSchema>;