/**
 * Zod schemas for plan_features table
 * Source: 22_commercial_layer.sql
 */

import { z } from "zod";

/** Schema for a plan_features row */
export const PlanFeaturesSchema = z.object({
  id: z.string().uuid(),
  plan_id: z.string().uuid(),
  feature_key: z.string(),
  is_enabled: z.number().int(),
  config: z.record(z.string(), z.unknown()).nullable(),
});

export type PlanFeatures = z.infer<typeof PlanFeaturesSchema>;

/** Schema for inserting a plan_features row */
export const PlanFeaturesInsertSchema = z.object({
  plan_id: z.string().uuid(),
  feature_key: z.string(),
  is_enabled: z.number().int().optional(),
  config: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type PlanFeaturesInsert = z.infer<typeof PlanFeaturesInsertSchema>;

/** Schema for updating a plan_features row */
export const PlanFeaturesUpdateSchema = PlanFeaturesInsertSchema.partial();

export type PlanFeaturesUpdate = z.infer<typeof PlanFeaturesUpdateSchema>;