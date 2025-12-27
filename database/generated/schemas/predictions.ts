/**
 * Zod schemas for predictions table
 * Source: 08_prediction.sql
 */

import { z } from "zod";

/** Schema for a predictions row */
export const PredictionsSchema = z.object({
  id: z.string().uuid(),
  prediction_model_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  case_id: z.string().uuid().nullable(),
  predicted_at: z.string().datetime({ offset: true }).or(z.string()),
  input_features: z.string(),
  prediction_value: z.string(),
  confidence: z.number().nullable(),
  probabilities: z.string().nullable(),
  actual_value: z.string().nullable(),
  is_correct: z.number().int().nullable(),
});

export type Predictions = z.infer<typeof PredictionsSchema>;

/** Schema for inserting a predictions row */
export const PredictionsInsertSchema = z.object({
  prediction_model_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  case_id: z.string().uuid().nullable().optional(),
  predicted_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
  input_features: z.string(),
  prediction_value: z.string(),
  confidence: z.number().nullable().optional(),
  probabilities: z.string().nullable().optional(),
  actual_value: z.string().nullable().optional(),
  is_correct: z.number().int().nullable().optional(),
});

export type PredictionsInsert = z.infer<typeof PredictionsInsertSchema>;

/** Schema for updating a predictions row */
export const PredictionsUpdateSchema = PredictionsInsertSchema.partial();

export type PredictionsUpdate = z.infer<typeof PredictionsUpdateSchema>;