/**
 * Zod schemas for conformance_jobs table
 * Source: 06_conformance.sql
 */

import { z } from "zod";

/** Schema for a conformance_jobs row */
export const ConformanceJobsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid().nullable(),
  data_pool_id: z.string().uuid().nullable(),
  model_id: z.string().uuid(),
  name: z.string(),
  method: z.enum(["token_replay", "alignment", "footprints"]),
  configuration: z.record(z.string(), z.unknown()).nullable(),
  schedule_cron: z.string().nullable(),
  is_active: z.number().int().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type ConformanceJobs = z.infer<typeof ConformanceJobsSchema>;

/** Schema for inserting a conformance_jobs row */
export const ConformanceJobsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid().nullable().optional(),
  data_pool_id: z.string().uuid().nullable().optional(),
  model_id: z.string().uuid(),
  name: z.string(),
  method: z.enum(["token_replay", "alignment", "footprints"]),
  configuration: z.record(z.string(), z.unknown()).nullable().optional(),
  schedule_cron: z.string().nullable().optional(),
  is_active: z.number().int().nullable().optional(),
});

export type ConformanceJobsInsert = z.infer<typeof ConformanceJobsInsertSchema>;

/** Schema for updating a conformance_jobs row */
export const ConformanceJobsUpdateSchema = ConformanceJobsInsertSchema.partial();

export type ConformanceJobsUpdate = z.infer<typeof ConformanceJobsUpdateSchema>;