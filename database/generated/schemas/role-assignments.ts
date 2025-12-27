/**
 * Zod schemas for role_assignments table
 * Source: 21_identity_layer.sql
 */

import { z } from "zod";

/** Schema for a role_assignments row */
export const RoleAssignmentsSchema = z.object({
  id: z.string().uuid(),
  role_id: z.string().uuid(),
  principal_type: z.enum(["user", "team", "service_account"]),
  principal_id: z.string().uuid(),
  scope_type: z.enum(["global", "organization", "team", "resource"]),
  scope_id: z.string().uuid().nullable(),
  granted_by: z.string(),
  granted_at: z.string().datetime({ offset: true }).or(z.string()),
  expires_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
});

export type RoleAssignments = z.infer<typeof RoleAssignmentsSchema>;

/** Schema for inserting a role_assignments row */
export const RoleAssignmentsInsertSchema = z.object({
  role_id: z.string().uuid(),
  principal_type: z.enum(["user", "team", "service_account"]),
  principal_id: z.string().uuid(),
  scope_type: z.enum(["global", "organization", "team", "resource"]).optional(),
  scope_id: z.string().uuid().nullable().optional(),
  granted_by: z.string(),
  granted_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
  expires_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
});

export type RoleAssignmentsInsert = z.infer<typeof RoleAssignmentsInsertSchema>;

/** Schema for updating a role_assignments row */
export const RoleAssignmentsUpdateSchema = RoleAssignmentsInsertSchema.partial();

export type RoleAssignmentsUpdate = z.infer<typeof RoleAssignmentsUpdateSchema>;