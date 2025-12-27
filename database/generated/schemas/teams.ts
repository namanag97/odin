/**
 * Zod schemas for teams table
 * Source: 21_identity_layer.sql
 */

import { z } from "zod";

/** Schema for a teams row */
export const TeamsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  organization_id: z.string().uuid().nullable(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  visibility: z.enum(["private", "internal", "public"]),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Teams = z.infer<typeof TeamsSchema>;

/** Schema for inserting a teams row */
export const TeamsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  organization_id: z.string().uuid().nullable().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  visibility: z.enum(["private", "internal", "public"]).optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type TeamsInsert = z.infer<typeof TeamsInsertSchema>;

/** Schema for updating a teams row */
export const TeamsUpdateSchema = TeamsInsertSchema.partial();

export type TeamsUpdate = z.infer<typeof TeamsUpdateSchema>;