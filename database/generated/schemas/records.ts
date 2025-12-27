/**
 * Zod schemas for records table
 * Source: 16_semantic.sql
 */

import { z } from "zod";

/** Schema for a records row */
export const RecordsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  knowledge_model_id: z.string().uuid(),
  key: z.string(),
  display_name: z.string().nullable(),
  description: z.string().nullable(),
  base_table: z.string(),
  identifier_attribute: z.string().nullable(),
  default_sort_attribute: z.string().nullable(),
  default_sort_order: z.enum(["asc", "desc"]).nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Records = z.infer<typeof RecordsSchema>;

/** Schema for inserting a records row */
export const RecordsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  knowledge_model_id: z.string().uuid(),
  key: z.string(),
  display_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  base_table: z.string(),
  identifier_attribute: z.string().nullable().optional(),
  default_sort_attribute: z.string().nullable().optional(),
  default_sort_order: z.enum(["asc", "desc"]).nullable().optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type RecordsInsert = z.infer<typeof RecordsInsertSchema>;

/** Schema for updating a records row */
export const RecordsUpdateSchema = RecordsInsertSchema.partial();

export type RecordsUpdate = z.infer<typeof RecordsUpdateSchema>;