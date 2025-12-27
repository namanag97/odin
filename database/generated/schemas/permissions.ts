/**
 * Zod schemas for permissions table
 * Source: 21_identity_layer.sql
 */

import { z } from "zod";

/** Schema for a permissions row */
export const PermissionsSchema = z.object({
  id: z.string().uuid(),
  resource: z.string(),
  action: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  is_sensitive: z.number().int(),
});

export type Permissions = z.infer<typeof PermissionsSchema>;

/** Schema for inserting a permissions row */
export const PermissionsInsertSchema = z.object({
  resource: z.string(),
  action: z.string(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  is_sensitive: z.number().int().optional(),
});

export type PermissionsInsert = z.infer<typeof PermissionsInsertSchema>;

/** Schema for updating a permissions row */
export const PermissionsUpdateSchema = PermissionsInsertSchema.partial();

export type PermissionsUpdate = z.infer<typeof PermissionsUpdateSchema>;