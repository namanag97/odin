/**
 * Zod schemas for prediction_features table
 * Source: 08_prediction.sql
 */

import { z } from "zod";

/** Schema for a prediction_features row */
export const PredictionFeaturesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  feature_type: z.enum(["case_attribute", "event_attribute", "derived", "temporal", "sequence"]),
  data_type: z.enum(["numeric", "categorical", "boolean", "embedding"]),
  source_column: z.string().nullable(),
  derivation_formula: z.string().nullable(),
  encoding_method: z.enum(["one_hot", "label", "embedding", "none"]).nullable(),
  normalization: z.enum(["standard", "minmax", "none"]).nullable(),
  missing_strategy: z.enum(["mean", "median", "mode", "zero", "drop"]).nullable(),
  statistics: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type PredictionFeatures = z.infer<typeof PredictionFeaturesSchema>;

/** Schema for inserting a prediction_features row */
export const PredictionFeaturesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  feature_type: z.enum(["case_attribute", "event_attribute", "derived", "temporal", "sequence"]),
  data_type: z.enum(["numeric", "categorical", "boolean", "embedding"]),
  source_column: z.string().nullable().optional(),
  derivation_formula: z.string().nullable().optional(),
  encoding_method: z.enum(["one_hot", "label", "embedding", "none"]).nullable().optional(),
  normalization: z.enum(["standard", "minmax", "none"]).nullable().optional(),
  missing_strategy: z.enum(["mean", "median", "mode", "zero", "drop"]).nullable().optional(),
  statistics: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type PredictionFeaturesInsert = z.infer<typeof PredictionFeaturesInsertSchema>;

/** Schema for updating a prediction_features row */
export const PredictionFeaturesUpdateSchema = PredictionFeaturesInsertSchema.partial();

export type PredictionFeaturesUpdate = z.infer<typeof PredictionFeaturesUpdateSchema>;