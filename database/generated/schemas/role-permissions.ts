/**
 * Zod schemas for role_permissions table
 * Source: 21_identity_layer.sql
 */

import { z } from "zod";

/** Schema for a role_permissions row */
export const RolePermissionsSchema = z.object({
  id: z.string().uuid(),
  role_id: z.string().uuid(),
  permission_id: z.string().uuid(),
  conditions: z.string().nullable(),
  granted_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type RolePermissions = z.infer<typeof RolePermissionsSchema>;

/** Schema for inserting a role_permissions row */
export const RolePermissionsInsertSchema = z.object({
  role_id: z.string().uuid(),
  permission_id: z.string().uuid(),
  conditions: z.string().nullable().optional(),
  granted_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
});

export type RolePermissionsInsert = z.infer<typeof RolePermissionsInsertSchema>;

/** Schema for updating a role_permissions row */
export const RolePermissionsUpdateSchema = RolePermissionsInsertSchema.partial();

export type RolePermissionsUpdate = z.infer<typeof RolePermissionsUpdateSchema>;