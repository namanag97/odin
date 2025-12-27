/**
 * Zod schemas for feature_flag_overrides table
 * Source: 23_operational_layer.sql
 */

import { z } from "zod";

/** Schema for a feature_flag_overrides row */
export const FeatureFlagOverridesSchema = z.object({
  id: z.string().uuid(),
  feature_flag_id: z.string().uuid(),
  target_type: z.enum(["tenant", "user", "segment"]),
  target_id: z.string().uuid(),
  value: z.string(),
  expires_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type FeatureFlagOverrides = z.infer<typeof FeatureFlagOverridesSchema>;

/** Schema for inserting a feature_flag_overrides row */
export const FeatureFlagOverridesInsertSchema = z.object({
  feature_flag_id: z.string().uuid(),
  target_type: z.enum(["tenant", "user", "segment"]),
  target_id: z.string().uuid(),
  value: z.string(),
  expires_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
});

export type FeatureFlagOverridesInsert = z.infer<typeof FeatureFlagOverridesInsertSchema>;

/** Schema for updating a feature_flag_overrides row */
export const FeatureFlagOverridesUpdateSchema = FeatureFlagOverridesInsertSchema.partial();

export type FeatureFlagOverridesUpdate = z.infer<typeof FeatureFlagOverridesUpdateSchema>;