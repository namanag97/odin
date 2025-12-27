/**
 * Zod schemas for ocel_object_types table
 * Source: 03_ocel.sql
 */

import { z } from "zod";

/** Schema for a ocel_object_types row */
export const OcelObjectTypesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  name: z.string(),
  display_name: z.string().nullable(),
  attribute_schema: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  object_count: z.number().int().nullable(),
  is_process_object: z.number().int().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type OcelObjectTypes = z.infer<typeof OcelObjectTypesSchema>;

/** Schema for inserting a ocel_object_types row */
export const OcelObjectTypesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  name: z.string(),
  display_name: z.string().nullable().optional(),
  attribute_schema: z.string().optional(),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  object_count: z.number().int().nullable().optional(),
  is_process_object: z.number().int().nullable().optional(),
});

export type OcelObjectTypesInsert = z.infer<typeof OcelObjectTypesInsertSchema>;

/** Schema for updating a ocel_object_types row */
export const OcelObjectTypesUpdateSchema = OcelObjectTypesInsertSchema.partial();

export type OcelObjectTypesUpdate = z.infer<typeof OcelObjectTypesUpdateSchema>;