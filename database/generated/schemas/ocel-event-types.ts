/**
 * Zod schemas for ocel_event_types table
 * Source: 03_ocel.sql
 */

import { z } from "zod";

/** Schema for a ocel_event_types row */
export const OcelEventTypesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  name: z.string(),
  display_name: z.string().nullable(),
  attribute_schema: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  color: z.string().nullable(),
  occurrence_count: z.number().int().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type OcelEventTypes = z.infer<typeof OcelEventTypesSchema>;

/** Schema for inserting a ocel_event_types row */
export const OcelEventTypesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  name: z.string(),
  display_name: z.string().nullable().optional(),
  attribute_schema: z.string().optional(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  occurrence_count: z.number().int().nullable().optional(),
});

export type OcelEventTypesInsert = z.infer<typeof OcelEventTypesInsertSchema>;

/** Schema for updating a ocel_event_types row */
export const OcelEventTypesUpdateSchema = OcelEventTypesInsertSchema.partial();

export type OcelEventTypesUpdate = z.infer<typeof OcelEventTypesUpdateSchema>;