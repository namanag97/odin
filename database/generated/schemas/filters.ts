/**
 * Zod schemas for filters table
 * Source: 16_semantic.sql
 */

import { z } from "zod";

/** Schema for a filters row */
export const FiltersSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  knowledge_model_id: z.string().uuid(),
  key: z.string(),
  display_name: z.string().nullable(),
  description: z.string().nullable(),
  pql_expression: z.string(),
  base_table: z.string().nullable(),
  filter_type: z.enum(["standard", "process", "forced"]),
  category: z.string().nullable(),
  is_default: z.number().int(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Filters = z.infer<typeof FiltersSchema>;

/** Schema for inserting a filters row */
export const FiltersInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  knowledge_model_id: z.string().uuid(),
  key: z.string(),
  display_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  pql_expression: z.string(),
  base_table: z.string().nullable().optional(),
  filter_type: z.enum(["standard", "process", "forced"]).optional(),
  category: z.string().nullable().optional(),
  is_default: z.number().int().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type FiltersInsert = z.infer<typeof FiltersInsertSchema>;

/** Schema for updating a filters row */
export const FiltersUpdateSchema = FiltersInsertSchema.partial();

export type FiltersUpdate = z.infer<typeof FiltersUpdateSchema>;