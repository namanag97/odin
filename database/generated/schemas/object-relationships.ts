/**
 * Zod schemas for object_relationships table
 * Source: 19_ocpm_extended.sql
 */

import { z } from "zod";

/** Schema for a object_relationships row */
export const ObjectRelationshipsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  perspective_id: z.string().uuid(),
  name: z.string(),
  source_object_type_id: z.string().uuid(),
  target_object_type_id: z.string().uuid(),
  cardinality: z.enum(["one_to_one", "one_to_many", "many_to_one", "many_to_many"]),
  join_columns: z.string(),
  is_embedded: z.number().int(),
  display_name: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type ObjectRelationships = z.infer<typeof ObjectRelationshipsSchema>;

/** Schema for inserting a object_relationships row */
export const ObjectRelationshipsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  perspective_id: z.string().uuid(),
  name: z.string(),
  source_object_type_id: z.string().uuid(),
  target_object_type_id: z.string().uuid(),
  cardinality: z.enum(["one_to_one", "one_to_many", "many_to_one", "many_to_many"]),
  join_columns: z.string(),
  is_embedded: z.number().int().optional(),
  display_name: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type ObjectRelationshipsInsert = z.infer<typeof ObjectRelationshipsInsertSchema>;

/** Schema for updating a object_relationships row */
export const ObjectRelationshipsUpdateSchema = ObjectRelationshipsInsertSchema.partial();

export type ObjectRelationshipsUpdate = z.infer<typeof ObjectRelationshipsUpdateSchema>;