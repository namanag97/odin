/**
 * Zod schemas for spaces table
 * Source: 17_studio.sql
 */

import { z } from "zod";

/** Schema for a spaces row */
export const SpacesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  is_default: z.number().int(),
  status: z.enum(["active", "archived"]),
  sort_order: z.number().int().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_by: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Spaces = z.infer<typeof SpacesSchema>;

/** Schema for inserting a spaces row */
export const SpacesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  is_default: z.number().int().optional(),
  status: z.enum(["active", "archived"]).optional(),
  sort_order: z.number().int().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  created_by: z.string().nullable().optional(),
});

export type SpacesInsert = z.infer<typeof SpacesInsertSchema>;

/** Schema for updating a spaces row */
export const SpacesUpdateSchema = SpacesInsertSchema.partial();

export type SpacesUpdate = z.infer<typeof SpacesUpdateSchema>;