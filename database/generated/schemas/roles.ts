/**
 * Zod schemas for roles table
 * Source: 21_identity_layer.sql
 */

import { z } from "zod";

/** Schema for a roles row */
export const RolesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid().nullable(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  type: z.enum(["system", "custom"]),
  scope: z.enum(["global", "organization", "team", "resource"]),
  is_default: z.number().int(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Roles = z.infer<typeof RolesSchema>;

/** Schema for inserting a roles row */
export const RolesInsertSchema = z.object({
  tenant_id: z.string().uuid().nullable().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  type: z.enum(["system", "custom"]).optional(),
  scope: z.enum(["global", "organization", "team", "resource"]).optional(),
  is_default: z.number().int().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type RolesInsert = z.infer<typeof RolesInsertSchema>;

/** Schema for updating a roles row */
export const RolesUpdateSchema = RolesInsertSchema.partial();

export type RolesUpdate = z.infer<typeof RolesUpdateSchema>;