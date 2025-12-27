/**
 * Zod schemas for columns table
 * Source: 15_data_model.sql
 */

import { z } from "zod";

/** Schema for a columns row */
export const ColumnsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  table_id: z.string().uuid(),
  name: z.string(),
  display_name: z.string().nullable(),
  data_type: z.enum(["string", "integer", "decimal", "boolean", "date", "datetime", "json", "array"]),
  source_data_type: z.string().nullable(),
  is_nullable: z.number().int(),
  is_primary_key: z.number().int(),
  is_indexed: z.number().int(),
  default_value: z.string().nullable(),
  format_pattern: z.string().nullable(),
  ordinal_position: z.number().int(),
  description: z.string().nullable(),
  statistics: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Columns = z.infer<typeof ColumnsSchema>;

/** Schema for inserting a columns row */
export const ColumnsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  table_id: z.string().uuid(),
  name: z.string(),
  display_name: z.string().nullable().optional(),
  data_type: z.enum(["string", "integer", "decimal", "boolean", "date", "datetime", "json", "array"]),
  source_data_type: z.string().nullable().optional(),
  is_nullable: z.number().int().optional(),
  is_primary_key: z.number().int().optional(),
  is_indexed: z.number().int().optional(),
  default_value: z.string().nullable().optional(),
  format_pattern: z.string().nullable().optional(),
  ordinal_position: z.number().int(),
  description: z.string().nullable().optional(),
  statistics: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type ColumnsInsert = z.infer<typeof ColumnsInsertSchema>;

/** Schema for updating a columns row */
export const ColumnsUpdateSchema = ColumnsInsertSchema.partial();

export type ColumnsUpdate = z.infer<typeof ColumnsUpdateSchema>;