/**
 * Zod schemas for sna_results table
 * Source: 07_analytics.sql
 */

import { z } from "zod";

/** Schema for a sna_results row */
export const SnaResultsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid(),
  name: z.string(),
  analyzed_at: z.string().datetime({ offset: true }).or(z.string()),
  analysis_type: z.enum(["handover", "working_together", "subcontracting", "similar_activities"]),
  network_data: z.string(),
  metrics: z.record(z.string(), z.unknown()).nullable(),
});

export type SnaResults = z.infer<typeof SnaResultsSchema>;

/** Schema for inserting a sna_results row */
export const SnaResultsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid(),
  name: z.string(),
  analyzed_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
  analysis_type: z.enum(["handover", "working_together", "subcontracting", "similar_activities"]),
  network_data: z.string(),
  metrics: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type SnaResultsInsert = z.infer<typeof SnaResultsInsertSchema>;

/** Schema for updating a sna_results row */
export const SnaResultsUpdateSchema = SnaResultsInsertSchema.partial();

export type SnaResultsUpdate = z.infer<typeof SnaResultsUpdateSchema>;