/**
 * Zod schemas for quality_metrics table
 * Source: 06_conformance.sql
 */

import { z } from "zod";

/** Schema for a quality_metrics row */
export const QualityMetricsSchema = z.object({
  id: z.string().uuid(),
  model_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  computed_at: z.string().datetime({ offset: true }).or(z.string()),
  metric_type: z.enum(["fitness", "precision", "generalization", "simplicity", "f_score"]),
  value: z.number(),
  method: z.string().nullable(),
  sample_size: z.number().int().nullable(),
  confidence_interval: z.string().nullable(),
});

export type QualityMetrics = z.infer<typeof QualityMetricsSchema>;

/** Schema for inserting a quality_metrics row */
export const QualityMetricsInsertSchema = z.object({
  model_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  computed_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
  metric_type: z.enum(["fitness", "precision", "generalization", "simplicity", "f_score"]),
  value: z.number(),
  method: z.string().nullable().optional(),
  sample_size: z.number().int().nullable().optional(),
  confidence_interval: z.string().nullable().optional(),
});

export type QualityMetricsInsert = z.infer<typeof QualityMetricsInsertSchema>;

/** Schema for updating a quality_metrics row */
export const QualityMetricsUpdateSchema = QualityMetricsInsertSchema.partial();

export type QualityMetricsUpdate = z.infer<typeof QualityMetricsUpdateSchema>;