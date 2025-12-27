/**
 * Zod schemas for metric_values table
 * Source: 07_analytics.sql
 */

import { z } from "zod";

/** Schema for a metric_values row */
export const MetricValuesSchema = z.object({
  id: z.string().uuid(),
  metric_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  measured_at: z.string().datetime({ offset: true }).or(z.string()),
  period_start: z.string(),
  period_end: z.string(),
  value: z.number(),
  sample_count: z.number().int().nullable(),
  dimensions: z.record(z.string(), z.unknown()).nullable(),
});

export type MetricValues = z.infer<typeof MetricValuesSchema>;

/** Schema for inserting a metric_values row */
export const MetricValuesInsertSchema = z.object({
  metric_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  measured_at: z.string().datetime({ offset: true }).or(z.string()),
  period_start: z.string(),
  period_end: z.string(),
  value: z.number(),
  sample_count: z.number().int().nullable().optional(),
  dimensions: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type MetricValuesInsert = z.infer<typeof MetricValuesInsertSchema>;

/** Schema for updating a metric_values row */
export const MetricValuesUpdateSchema = MetricValuesInsertSchema.partial();

export type MetricValuesUpdate = z.infer<typeof MetricValuesUpdateSchema>;