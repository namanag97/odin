/**
 * Zod schemas for tenants table
 * Source: 01_core.sql
 */

import { z } from "zod";

/** Schema for a tenants row */
export const TenantsSchema = z.object({
  id: z.string().uuid(),
  external_id: z.string().uuid().nullable(),
  name: z.string(),
  slug: z.string(),
  type: z.enum(["individual", "team", "enterprise"]),
  status: z.enum(["provisioning", "active", "suspended", "terminated"]),
  tier: z.enum(["free", "starter", "professional", "enterprise"]),
  settings: z.record(z.string(), z.unknown()).nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  storage_quota_gb: z.number().int().nullable(),
  event_quota_monthly: z.number().int().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
  deleted_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
});

export type Tenants = z.infer<typeof TenantsSchema>;

/** Schema for inserting a tenants row */
export const TenantsInsertSchema = z.object({
  external_id: z.string().uuid().nullable().optional(),
  name: z.string(),
  slug: z.string(),
  type: z.enum(["individual", "team", "enterprise"]).optional(),
  status: z.enum(["provisioning", "active", "suspended", "terminated"]).optional(),
  tier: z.enum(["free", "starter", "professional", "enterprise"]).optional(),
  settings: z.record(z.string(), z.unknown()).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  storage_quota_gb: z.number().int().nullable().optional(),
  event_quota_monthly: z.number().int().nullable().optional(),
  deleted_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
});

export type TenantsInsert = z.infer<typeof TenantsInsertSchema>;

/** Schema for updating a tenants row */
export const TenantsUpdateSchema = TenantsInsertSchema.partial();

export type TenantsUpdate = z.infer<typeof TenantsUpdateSchema>;