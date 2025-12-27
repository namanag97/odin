/**
 * Zod schemas for object_types table
 * Source: 19_ocpm_extended.sql
 */

import { z } from "zod";

/** Schema for a object_types row */
export const ObjectTypesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  perspective_id: z.string().uuid(),
  name: z.string(),
  display_name: z.string().nullable(),
  description: z.string().nullable(),
  source_table: z.string().nullable(),
  identifier_columns: z.string(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  tags: z.array(z.unknown()).nullable(),
  is_lead_object: z.number().int(),
  status: z.enum(["draft", "published", "deprecated"]),
  attribute_schema: z.record(z.string(), z.unknown()).nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_by: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
  published_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
});

export type ObjectTypes = z.infer<typeof ObjectTypesSchema>;

/** Schema for inserting a object_types row */
export const ObjectTypesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  perspective_id: z.string().uuid(),
  name: z.string(),
  display_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  source_table: z.string().nullable().optional(),
  identifier_columns: z.string(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  tags: z.array(z.unknown()).nullable().optional(),
  is_lead_object: z.number().int().optional(),
  status: z.enum(["draft", "published", "deprecated"]).optional(),
  attribute_schema: z.record(z.string(), z.unknown()).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  created_by: z.string().nullable().optional(),
  published_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
});

export type ObjectTypesInsert = z.infer<typeof ObjectTypesInsertSchema>;

/** Schema for updating a object_types row */
export const ObjectTypesUpdateSchema = ObjectTypesInsertSchema.partial();

export type ObjectTypesUpdate = z.infer<typeof ObjectTypesUpdateSchema>;