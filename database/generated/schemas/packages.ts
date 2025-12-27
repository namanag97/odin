/**
 * Zod schemas for packages table
 * Source: 17_studio.sql
 */

import { z } from "zod";

/** Schema for a packages row */
export const PackagesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  space_id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  status: z.enum(["draft", "published", "archived"]),
  version: z.string().nullable(),
  is_template: z.number().int(),
  source_package_id: z.string().uuid().nullable(),
  data_model_variable_id: z.string().uuid().nullable(),
  published_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_by: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Packages = z.infer<typeof PackagesSchema>;

/** Schema for inserting a packages row */
export const PackagesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  space_id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  version: z.string().nullable().optional(),
  is_template: z.number().int().optional(),
  source_package_id: z.string().uuid().nullable().optional(),
  data_model_variable_id: z.string().uuid().nullable().optional(),
  published_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  created_by: z.string().nullable().optional(),
});

export type PackagesInsert = z.infer<typeof PackagesInsertSchema>;

/** Schema for updating a packages row */
export const PackagesUpdateSchema = PackagesInsertSchema.partial();

export type PackagesUpdate = z.infer<typeof PackagesUpdateSchema>;