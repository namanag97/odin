/**
 * Zod schemas for kpis table
 * Source: 16_semantic.sql
 */

import { z } from "zod";

/** Schema for a kpis row */
export const KpisSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  knowledge_model_id: z.string().uuid(),
  key: z.string(),
  display_name: z.string().nullable(),
  description: z.string().nullable(),
  pql_expression: z.string(),
  return_type: z.enum(["number", "string", "date", "boolean", "array"]),
  format_string: z.string().nullable(),
  unit: z.string().nullable(),
  unit_position: z.enum(["prefix", "suffix"]).nullable(),
  aggregation_type: z.enum(["sum", "avg", "min", "max", "count", "count_distinct", "custom"]).nullable(),
  is_global: z.number().int(),
  category: z.string().nullable(),
  parameters: z.array(z.unknown()).nullable(),
  thresholds: z.array(z.unknown()).nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Kpis = z.infer<typeof KpisSchema>;

/** Schema for inserting a kpis row */
export const KpisInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  knowledge_model_id: z.string().uuid(),
  key: z.string(),
  display_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  pql_expression: z.string(),
  return_type: z.enum(["number", "string", "date", "boolean", "array"]).optional(),
  format_string: z.string().nullable().optional(),
  unit: z.string().nullable().optional(),
  unit_position: z.enum(["prefix", "suffix"]).nullable().optional(),
  aggregation_type: z.enum(["sum", "avg", "min", "max", "count", "count_distinct", "custom"]).nullable().optional(),
  is_global: z.number().int().optional(),
  category: z.string().nullable().optional(),
  parameters: z.array(z.unknown()).nullable().optional(),
  thresholds: z.array(z.unknown()).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type KpisInsert = z.infer<typeof KpisInsertSchema>;

/** Schema for updating a kpis row */
export const KpisUpdateSchema = KpisInsertSchema.partial();

export type KpisUpdate = z.infer<typeof KpisUpdateSchema>;