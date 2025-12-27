/**
 * Zod schemas for organizations table
 * Source: 20_existence_layer.sql
 */

import { z } from "zod";

/** Schema for a organizations row */
export const OrganizationsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  parent_org_id: z.string().uuid().nullable(),
  name: z.string(),
  code: z.string(),
  type: z.enum(["division", "department", "unit", "custom"]),
  hierarchy_path: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  is_active: z.number().int(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Organizations = z.infer<typeof OrganizationsSchema>;

/** Schema for inserting a organizations row */
export const OrganizationsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  parent_org_id: z.string().uuid().nullable().optional(),
  name: z.string(),
  code: z.string(),
  type: z.enum(["division", "department", "unit", "custom"]),
  hierarchy_path: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  is_active: z.number().int().optional(),
});

export type OrganizationsInsert = z.infer<typeof OrganizationsInsertSchema>;

/** Schema for updating a organizations row */
export const OrganizationsUpdateSchema = OrganizationsInsertSchema.partial();

export type OrganizationsUpdate = z.infer<typeof OrganizationsUpdateSchema>;