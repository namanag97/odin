/**
 * Zod schemas for data_models table
 * Source: 15_data_model.sql
 */

import { z } from "zod";

/** Schema for a data_models row */
export const DataModelsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  model_type: z.enum(["case_centric", "object_centric"]),
  activity_table_id: z.string().uuid().nullable(),
  case_table_id: z.string().uuid().nullable(),
  case_column: z.string().nullable(),
  activity_column: z.string().nullable(),
  timestamp_column: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  sorting_column: z.string().nullable(),
  load_status: z.enum(["pending", "loading", "loaded", "failed", "stale"]),
  last_loaded_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  load_type: z.enum(["full", "delta"]),
  row_counts: z.record(z.string(), z.unknown()).nullable(),
  version: z.number().int(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_by: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type DataModels = z.infer<typeof DataModelsSchema>;

/** Schema for inserting a data_models row */
export const DataModelsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  model_type: z.enum(["case_centric", "object_centric"]).optional(),
  activity_table_id: z.string().uuid().nullable().optional(),
  case_table_id: z.string().uuid().nullable().optional(),
  case_column: z.string().nullable().optional(),
  activity_column: z.string().nullable().optional(),
  timestamp_column: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  sorting_column: z.string().nullable().optional(),
  load_status: z.enum(["pending", "loading", "loaded", "failed", "stale"]).optional(),
  last_loaded_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  load_type: z.enum(["full", "delta"]).optional(),
  row_counts: z.record(z.string(), z.unknown()).nullable().optional(),
  version: z.number().int().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  created_by: z.string().nullable().optional(),
});

export type DataModelsInsert = z.infer<typeof DataModelsInsertSchema>;

/** Schema for updating a data_models row */
export const DataModelsUpdateSchema = DataModelsInsertSchema.partial();

export type DataModelsUpdate = z.infer<typeof DataModelsUpdateSchema>;