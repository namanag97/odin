/**
 * Zod schemas for model_evaluations table
 * Source: 08_prediction.sql
 */

import { z } from "zod";

/** Schema for a model_evaluations row */
export const ModelEvaluationsSchema = z.object({
  id: z.string().uuid(),
  prediction_model_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  evaluated_at: z.string().datetime({ offset: true }).or(z.string()),
  evaluation_type: z.enum(["training", "validation", "test", "production"]),
  sample_size: z.number().int(),
  metrics: z.string(),
});

export type ModelEvaluations = z.infer<typeof ModelEvaluationsSchema>;

/** Schema for inserting a model_evaluations row */
export const ModelEvaluationsInsertSchema = z.object({
  prediction_model_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  evaluated_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
  evaluation_type: z.enum(["training", "validation", "test", "production"]),
  sample_size: z.number().int(),
  metrics: z.string(),
});

export type ModelEvaluationsInsert = z.infer<typeof ModelEvaluationsInsertSchema>;

/** Schema for updating a model_evaluations row */
export const ModelEvaluationsUpdateSchema = ModelEvaluationsInsertSchema.partial();

export type ModelEvaluationsUpdate = z.infer<typeof ModelEvaluationsUpdateSchema>;