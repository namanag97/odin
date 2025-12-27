/**
 * Zod schemas for import_job_runs table
 * Source: 01_core.sql
 */

import { z } from "zod";

/** Schema for a import_job_runs row */
export const ImportJobRunsSchema = z.object({
  id: z.string().uuid(),
  job_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  status: z.enum(["pending", "running", "success", "failed", "cancelled"]),
  started_at: z.string().datetime({ offset: true }).or(z.string()),
  completed_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  rows_read: z.number().int().nullable(),
  rows_written: z.number().int().nullable(),
  events_created: z.number().int().nullable(),
  cases_created: z.number().int().nullable(),
  objects_created: z.number().int().nullable(),
  error_message: z.string().nullable(),
  error_details: z.string().nullable(),
  metrics: z.record(z.string(), z.unknown()).nullable(),
});

export type ImportJobRuns = z.infer<typeof ImportJobRunsSchema>;

/** Schema for inserting a import_job_runs row */
export const ImportJobRunsInsertSchema = z.object({
  job_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  status: z.enum(["pending", "running", "success", "failed", "cancelled"]),
  started_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
  completed_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  rows_read: z.number().int().nullable().optional(),
  rows_written: z.number().int().nullable().optional(),
  events_created: z.number().int().nullable().optional(),
  cases_created: z.number().int().nullable().optional(),
  objects_created: z.number().int().nullable().optional(),
  error_message: z.string().nullable().optional(),
  error_details: z.string().nullable().optional(),
  metrics: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type ImportJobRunsInsert = z.infer<typeof ImportJobRunsInsertSchema>;

/** Schema for updating a import_job_runs row */
export const ImportJobRunsUpdateSchema = ImportJobRunsInsertSchema.partial();

export type ImportJobRunsUpdate = z.infer<typeof ImportJobRunsUpdateSchema>;