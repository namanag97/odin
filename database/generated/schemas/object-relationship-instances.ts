/**
 * Zod schemas for object_relationship_instances table
 * Source: 19_ocpm_extended.sql
 */

import { z } from "zod";

/** Schema for a object_relationship_instances row */
export const ObjectRelationshipInstancesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  relationship_id: z.string().uuid(),
  source_object_id: z.string().uuid(),
  target_object_id: z.string().uuid(),
  valid_from: z.string().nullable(),
  valid_to: z.string().nullable(),
  attributes: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type ObjectRelationshipInstances = z.infer<typeof ObjectRelationshipInstancesSchema>;

/** Schema for inserting a object_relationship_instances row */
export const ObjectRelationshipInstancesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  relationship_id: z.string().uuid(),
  source_object_id: z.string().uuid(),
  target_object_id: z.string().uuid(),
  valid_from: z.string().nullable().optional(),
  valid_to: z.string().nullable().optional(),
  attributes: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type ObjectRelationshipInstancesInsert = z.infer<typeof ObjectRelationshipInstancesInsertSchema>;

/** Schema for updating a object_relationship_instances row */
export const ObjectRelationshipInstancesUpdateSchema = ObjectRelationshipInstancesInsertSchema.partial();

export type ObjectRelationshipInstancesUpdate = z.infer<typeof ObjectRelationshipInstancesUpdateSchema>;