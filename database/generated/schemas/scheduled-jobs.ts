/**
 * Zod schemas for scheduled_jobs table
 * Source: 10_automation.sql
 */

import { z } from "zod";

/** Schema for a scheduled_jobs row */
export const ScheduledJobsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  job_type: z.enum(["import", "discovery", "conformance", "prediction", "workflow", "metric_compute", "statistics_refresh"]),
  target_id: z.string().uuid().nullable(),
  cron_expression: z.string(),
  timezone: z.string().nullable(),
  is_active: z.number().int().nullable(),
  next_run_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  last_run_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  last_status: z.enum(["success", "failed", "running"]).nullable(),
  configuration: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type ScheduledJobs = z.infer<typeof ScheduledJobsSchema>;

/** Schema for inserting a scheduled_jobs row */
export const ScheduledJobsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string(),
  job_type: z.enum(["import", "discovery", "conformance", "prediction", "workflow", "metric_compute", "statistics_refresh"]),
  target_id: z.string().uuid().nullable().optional(),
  cron_expression: z.string(),
  timezone: z.string().nullable().optional(),
  is_active: z.number().int().nullable().optional(),
  next_run_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  last_run_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  last_status: z.enum(["success", "failed", "running"]).nullable().optional(),
  configuration: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type ScheduledJobsInsert = z.infer<typeof ScheduledJobsInsertSchema>;

/** Schema for updating a scheduled_jobs row */
export const ScheduledJobsUpdateSchema = ScheduledJobsInsertSchema.partial();

export type ScheduledJobsUpdate = z.infer<typeof ScheduledJobsUpdateSchema>;