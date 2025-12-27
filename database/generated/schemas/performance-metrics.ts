/**
 * Zod schemas for performance_metrics table
 * Source: 07_analytics.sql
 */

import { z } from "zod";

/** Schema for a performance_metrics row */
export const PerformanceMetricsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid().nullable(),
  data_pool_id: z.string().uuid().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  metric_type: z.enum(["throughput_time", "waiting_time", "service_time", "count", "cost", "custom"]),
  aggregation: z.enum(["avg", "sum", "min", "max", "median", "p95", "count"]).nullable(),
  unit: z.string().nullable(),
  formula: z.string().nullable(),
  filter_conditions: z.record(z.string(), z.unknown()).nullable(),
  thresholds: z.record(z.string(), z.unknown()).nullable(),
  is_active: z.number().int().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;

/** Schema for inserting a performance_metrics row */
export const PerformanceMetricsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid().nullable().optional(),
  data_pool_id: z.string().uuid().nullable().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  metric_type: z.enum(["throughput_time", "waiting_time", "service_time", "count", "cost", "custom"]),
  aggregation: z.enum(["avg", "sum", "min", "max", "median", "p95", "count"]).nullable().optional(),
  unit: z.string().nullable().optional(),
  formula: z.string().nullable().optional(),
  filter_conditions: z.record(z.string(), z.unknown()).nullable().optional(),
  thresholds: z.record(z.string(), z.unknown()).nullable().optional(),
  is_active: z.number().int().nullable().optional(),
});

export type PerformanceMetricsInsert = z.infer<typeof PerformanceMetricsInsertSchema>;

/** Schema for updating a performance_metrics row */
export const PerformanceMetricsUpdateSchema = PerformanceMetricsInsertSchema.partial();

export type PerformanceMetricsUpdate = z.infer<typeof PerformanceMetricsUpdateSchema>;