/**
 * Zod schemas for data_job_tasks table
 * Source: 15_data_model.sql
 */

import { z } from "zod";

/** Schema for a data_job_tasks row */
export const DataJobTasksSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  data_job_id: z.string().uuid(),
  name: z.string(),
  task_type: z.enum(["extraction", "transformation", "load", "custom"]),
  execution_order: z.number().int(),
  source_connection_id: z.string().uuid().nullable(),
  source_query: z.string().nullable(),
  target_table_id: z.string().uuid().nullable(),
  transformation_sql: z.string().nullable(),
  extraction_mode: z.enum(["full", "delta"]),
  delta_column: z.string().nullable(),
  delta_value: z.string().nullable(),
  is_enabled: z.number().int(),
  timeout_seconds: z.number().int().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type DataJobTasks = z.infer<typeof DataJobTasksSchema>;

/** Schema for inserting a data_job_tasks row */
export const DataJobTasksInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  data_job_id: z.string().uuid(),
  name: z.string(),
  task_type: z.enum(["extraction", "transformation", "load", "custom"]),
  execution_order: z.number().int(),
  source_connection_id: z.string().uuid().nullable().optional(),
  source_query: z.string().nullable().optional(),
  target_table_id: z.string().uuid().nullable().optional(),
  transformation_sql: z.string().nullable().optional(),
  extraction_mode: z.enum(["full", "delta"]).optional(),
  delta_column: z.string().nullable().optional(),
  delta_value: z.string().nullable().optional(),
  is_enabled: z.number().int().optional(),
  timeout_seconds: z.number().int().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type DataJobTasksInsert = z.infer<typeof DataJobTasksInsertSchema>;

/** Schema for updating a data_job_tasks row */
export const DataJobTasksUpdateSchema = DataJobTasksInsertSchema.partial();

export type DataJobTasksUpdate = z.infer<typeof DataJobTasksUpdateSchema>;