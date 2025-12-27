/**
 * Zod schemas for bottleneck_analyses table
 * Source: 07_analytics.sql
 */

import { z } from "zod";

/** Schema for a bottleneck_analyses row */
export const BottleneckAnalysesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid().nullable(),
  data_pool_id: z.string().uuid().nullable(),
  name: z.string(),
  analyzed_at: z.string().datetime({ offset: true }).or(z.string()),
  method: z.enum(["sojourn_time", "waiting_time", "queue_length"]),
  results: z.string(),
  recommendations: z.array(z.unknown()).nullable(),
});

export type BottleneckAnalyses = z.infer<typeof BottleneckAnalysesSchema>;

/** Schema for inserting a bottleneck_analyses row */
export const BottleneckAnalysesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid().nullable().optional(),
  data_pool_id: z.string().uuid().nullable().optional(),
  name: z.string(),
  analyzed_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
  method: z.enum(["sojourn_time", "waiting_time", "queue_length"]),
  results: z.string(),
  recommendations: z.array(z.unknown()).nullable().optional(),
});

export type BottleneckAnalysesInsert = z.infer<typeof BottleneckAnalysesInsertSchema>;

/** Schema for updating a bottleneck_analyses row */
export const BottleneckAnalysesUpdateSchema = BottleneckAnalysesInsertSchema.partial();

export type BottleneckAnalysesUpdate = z.infer<typeof BottleneckAnalysesUpdateSchema>;