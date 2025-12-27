/**
 * Zod schemas for job_executions table
 * Source: 15_data_model.sql
 */

import { z } from "zod";

/** Schema for a job_executions row */
export const JobExecutionsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  data_job_id: z.string().uuid(),
  triggered_by: z.enum(["schedule", "manual", "api", "dependent"]),
  triggered_by_user_id: z.string().uuid().nullable(),
  status: z.enum(["pending", "running", "success", "failed", "cancelled"]),
  started_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  completed_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  duration_ms: z.number().int().nullable(),
  rows_processed: z.number().int().nullable(),
  rows_failed: z.number().int().nullable(),
  error_message: z.string().nullable(),
  error_details: z.record(z.string(), z.unknown()).nullable(),
  task_results: z.array(z.unknown()).nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type JobExecutions = z.infer<typeof JobExecutionsSchema>;

/** Schema for inserting a job_executions row */
export const JobExecutionsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  data_job_id: z.string().uuid(),
  triggered_by: z.enum(["schedule", "manual", "api", "dependent"]),
  triggered_by_user_id: z.string().uuid().nullable().optional(),
  status: z.enum(["pending", "running", "success", "failed", "cancelled"]).optional(),
  started_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  completed_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  duration_ms: z.number().int().nullable().optional(),
  rows_processed: z.number().int().nullable().optional(),
  rows_failed: z.number().int().nullable().optional(),
  error_message: z.string().nullable().optional(),
  error_details: z.record(z.string(), z.unknown()).nullable().optional(),
  task_results: z.array(z.unknown()).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type JobExecutionsInsert = z.infer<typeof JobExecutionsInsertSchema>;

/** Schema for updating a job_executions row */
export const JobExecutionsUpdateSchema = JobExecutionsInsertSchema.partial();

export type JobExecutionsUpdate = z.infer<typeof JobExecutionsUpdateSchema>;