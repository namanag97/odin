/**
 * Zod schemas for record_attributes table
 * Source: 16_semantic.sql
 */

import { z } from "zod";

/** Schema for a record_attributes row */
export const RecordAttributesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  record_id: z.string().uuid(),
  key: z.string(),
  display_name: z.string().nullable(),
  description: z.string().nullable(),
  attribute_type: z.enum(["column", "calculated", "augmented"]),
  source_column: z.string().nullable(),
  pql_expression: z.string().nullable(),
  data_type: z.enum(["string", "number", "date", "boolean", "array"]),
  format_string: z.string().nullable(),
  is_identifier: z.number().int(),
  is_filterable: z.number().int(),
  is_sortable: z.number().int(),
  ordinal_position: z.number().int().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type RecordAttributes = z.infer<typeof RecordAttributesSchema>;

/** Schema for inserting a record_attributes row */
export const RecordAttributesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  record_id: z.string().uuid(),
  key: z.string(),
  display_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  attribute_type: z.enum(["column", "calculated", "augmented"]).optional(),
  source_column: z.string().nullable().optional(),
  pql_expression: z.string().nullable().optional(),
  data_type: z.enum(["string", "number", "date", "boolean", "array"]),
  format_string: z.string().nullable().optional(),
  is_identifier: z.number().int().optional(),
  is_filterable: z.number().int().optional(),
  is_sortable: z.number().int().optional(),
  ordinal_position: z.number().int().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type RecordAttributesInsert = z.infer<typeof RecordAttributesInsertSchema>;

/** Schema for updating a record_attributes row */
export const RecordAttributesUpdateSchema = RecordAttributesInsertSchema.partial();

export type RecordAttributesUpdate = z.infer<typeof RecordAttributesUpdateSchema>;