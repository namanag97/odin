/**
 * Zod schemas for ocel_objects table
 * Source: 03_ocel.sql
 */

import { z } from "zod";

/** Schema for a ocel_objects row */
export const OcelObjectsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  ocel_id: z.string().uuid(),
  object_type_id: z.string().uuid(),
  object_type_name: z.string(),
  attributes: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type OcelObjects = z.infer<typeof OcelObjectsSchema>;

/** Schema for inserting a ocel_objects row */
export const OcelObjectsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  ocel_id: z.string().uuid(),
  object_type_id: z.string().uuid(),
  object_type_name: z.string(),
  attributes: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type OcelObjectsInsert = z.infer<typeof OcelObjectsInsertSchema>;

/** Schema for updating a ocel_objects row */
export const OcelObjectsUpdateSchema = OcelObjectsInsertSchema.partial();

export type OcelObjectsUpdate = z.infer<typeof OcelObjectsUpdateSchema>;