/**
 * Zod schemas for tables table
 * Source: 15_data_model.sql
 */

import { z } from "zod";

/** Schema for a tables row */
export const TablesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  name: z.string(),
  display_name: z.string().nullable(),
  description: z.string().nullable(),
  table_type: z.enum(["physical", "view", "materialized", "external"]),
  source_connection_id: z.string().uuid().nullable(),
  source_schema: z.string().nullable(),
  source_table: z.string().nullable(),
  transformation_sql: z.string().nullable(),
  row_count: z.number().int().nullable(),
  size_bytes: z.number().int().nullable(),
  last_sync_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  is_activity_table: z.number().int(),
  is_case_table: z.number().int(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Tables = z.infer<typeof TablesSchema>;

/** Schema for inserting a tables row */
export const TablesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  name: z.string(),
  display_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  table_type: z.enum(["physical", "view", "materialized", "external"]).optional(),
  source_connection_id: z.string().uuid().nullable().optional(),
  source_schema: z.string().nullable().optional(),
  source_table: z.string().nullable().optional(),
  transformation_sql: z.string().nullable().optional(),
  row_count: z.number().int().nullable().optional(),
  size_bytes: z.number().int().nullable().optional(),
  last_sync_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  is_activity_table: z.number().int().optional(),
  is_case_table: z.number().int().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type TablesInsert = z.infer<typeof TablesInsertSchema>;

/** Schema for updating a tables row */
export const TablesUpdateSchema = TablesInsertSchema.partial();

export type TablesUpdate = z.infer<typeof TablesUpdateSchema>;