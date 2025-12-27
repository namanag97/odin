/**
 * Zod schemas for system_configs table
 * Source: 23_operational_layer.sql
 */

import { z } from "zod";

/** Schema for a system_configs row */
export const SystemConfigsSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  value: z.string(),
  type: z.enum(["string", "number", "boolean", "json", "secret"]),
  description: z.string().nullable(),
  is_sensitive: z.number().int(),
  updated_by: z.string().nullable(),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type SystemConfigs = z.infer<typeof SystemConfigsSchema>;

/** Schema for inserting a system_configs row */
export const SystemConfigsInsertSchema = z.object({
  key: z.string(),
  value: z.string(),
  type: z.enum(["string", "number", "boolean", "json", "secret"]),
  description: z.string().nullable().optional(),
  is_sensitive: z.number().int().optional(),
  updated_by: z.string().nullable().optional(),
});

export type SystemConfigsInsert = z.infer<typeof SystemConfigsInsertSchema>;

/** Schema for updating a system_configs row */
export const SystemConfigsUpdateSchema = SystemConfigsInsertSchema.partial();

export type SystemConfigsUpdate = z.infer<typeof SystemConfigsUpdateSchema>;