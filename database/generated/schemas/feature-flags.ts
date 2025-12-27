/**
 * Zod schemas for feature_flags table
 * Source: 23_operational_layer.sql
 */

import { z } from "zod";

/** Schema for a feature_flags row */
export const FeatureFlagsSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  type: z.enum(["boolean", "percentage", "variant", "json"]),
  default_value: z.string().nullable(),
  is_enabled: z.number().int(),
  targeting_rules: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;

/** Schema for inserting a feature_flags row */
export const FeatureFlagsInsertSchema = z.object({
  key: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  type: z.enum(["boolean", "percentage", "variant", "json"]).optional(),
  default_value: z.string().nullable().optional(),
  is_enabled: z.number().int().optional(),
  targeting_rules: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type FeatureFlagsInsert = z.infer<typeof FeatureFlagsInsertSchema>;

/** Schema for updating a feature_flags row */
export const FeatureFlagsUpdateSchema = FeatureFlagsInsertSchema.partial();

export type FeatureFlagsUpdate = z.infer<typeof FeatureFlagsUpdateSchema>;