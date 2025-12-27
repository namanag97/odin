/**
 * Zod schemas for import_jobs table
 * Source: 01_core.sql
 */

import { z } from "zod";

/** Schema for a import_jobs row */
export const ImportJobsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  connection_id: z.string().uuid().nullable(),
  name: z.string(),
  job_type: z.enum(["extraction", "transformation", "full_load", "incremental", "file_import", "database_extract"]),
  source_query: z.string().nullable(),
  mapping_config: z.record(z.string(), z.unknown()),
  schedule_cron: z.string().nullable(),
  is_active: z.number().int().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type ImportJobs = z.infer<typeof ImportJobsSchema>;

/** Schema for inserting a import_jobs row */
export const ImportJobsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  connection_id: z.string().uuid().nullable().optional(),
  name: z.string(),
  job_type: z.enum(["extraction", "transformation", "full_load", "incremental", "file_import", "database_extract"]),
  source_query: z.string().nullable().optional(),
  mapping_config: z.record(z.string(), z.unknown()),
  schedule_cron: z.string().nullable().optional(),
  is_active: z.number().int().nullable().optional(),
});

export type ImportJobsInsert = z.infer<typeof ImportJobsInsertSchema>;

/** Schema for updating a import_jobs row */
export const ImportJobsUpdateSchema = ImportJobsInsertSchema.partial();

export type ImportJobsUpdate = z.infer<typeof ImportJobsUpdateSchema>;