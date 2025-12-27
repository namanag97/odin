/**
 * Zod schemas for resources table
 * Source: 02_case_centric.sql
 */

import { z } from "zod";

/** Schema for a resources row */
export const ResourcesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid(),
  name: z.string(),
  display_name: z.string().nullable(),
  resource_type: z.enum(["human", "system", "bot"]).nullable(),
  department: z.string().nullable(),
  role: z.string().nullable(),
  email: z.string().nullable(),
  event_count: z.number().int().nullable(),
  distinct_activities: z.number().int().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Resources = z.infer<typeof ResourcesSchema>;

/** Schema for inserting a resources row */
export const ResourcesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid(),
  name: z.string(),
  display_name: z.string().nullable().optional(),
  resource_type: z.enum(["human", "system", "bot"]).nullable().optional(),
  department: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  event_count: z.number().int().nullable().optional(),
  distinct_activities: z.number().int().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type ResourcesInsert = z.infer<typeof ResourcesInsertSchema>;

/** Schema for updating a resources row */
export const ResourcesUpdateSchema = ResourcesInsertSchema.partial();

export type ResourcesUpdate = z.infer<typeof ResourcesUpdateSchema>;