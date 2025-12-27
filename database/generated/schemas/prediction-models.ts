/**
 * Zod schemas for prediction_models table
 * Source: 08_prediction.sql
 */

import { z } from "zod";

/** Schema for a prediction_models row */
export const PredictionModelsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid().nullable(),
  data_pool_id: z.string().uuid().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  prediction_type: z.enum(["next_activity", "remaining_time", "outcome", "next_timestamp"]),
  algorithm: z.string(),
  hyperparameters: z.record(z.string(), z.unknown()).nullable(),
  feature_ids: z.string(),
  model_binary: z.string().nullable(),
  model_file_path: z.string().nullable(),
  training_date: z.string(),
  training_samples: z.number().int().nullable(),
  status: z.enum(["training", "trained", "deployed", "retired"]).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type PredictionModels = z.infer<typeof PredictionModelsSchema>;

/** Schema for inserting a prediction_models row */
export const PredictionModelsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid().nullable().optional(),
  data_pool_id: z.string().uuid().nullable().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  prediction_type: z.enum(["next_activity", "remaining_time", "outcome", "next_timestamp"]),
  algorithm: z.string(),
  hyperparameters: z.record(z.string(), z.unknown()).nullable().optional(),
  feature_ids: z.string(),
  model_binary: z.string().nullable().optional(),
  model_file_path: z.string().nullable().optional(),
  training_date: z.string(),
  training_samples: z.number().int().nullable().optional(),
  status: z.enum(["training", "trained", "deployed", "retired"]).nullable().optional(),
});

export type PredictionModelsInsert = z.infer<typeof PredictionModelsInsertSchema>;

/** Schema for updating a prediction_models row */
export const PredictionModelsUpdateSchema = PredictionModelsInsertSchema.partial();

export type PredictionModelsUpdate = z.infer<typeof PredictionModelsUpdateSchema>;