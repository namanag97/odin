/**
 * Zod schemas for ocel_object_changes table
 * Source: 03_ocel.sql
 */

import { z } from "zod";

/** Schema for a ocel_object_changes row */
export const OcelObjectChangesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  object_id: z.string().uuid(),
  event_id: z.string().uuid().nullable(),
  attribute_name: z.string(),
  old_value: z.string().nullable(),
  new_value: z.string(),
  changed_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type OcelObjectChanges = z.infer<typeof OcelObjectChangesSchema>;

/** Schema for inserting a ocel_object_changes row */
export const OcelObjectChangesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  object_id: z.string().uuid(),
  event_id: z.string().uuid().nullable().optional(),
  attribute_name: z.string(),
  old_value: z.string().nullable().optional(),
  new_value: z.string(),
  changed_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type OcelObjectChangesInsert = z.infer<typeof OcelObjectChangesInsertSchema>;

/** Schema for updating a ocel_object_changes row */
export const OcelObjectChangesUpdateSchema = OcelObjectChangesInsertSchema.partial();

export type OcelObjectChangesUpdate = z.infer<typeof OcelObjectChangesUpdateSchema>;