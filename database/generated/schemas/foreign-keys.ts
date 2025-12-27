/**
 * Zod schemas for foreign_keys table
 * Source: 15_data_model.sql
 */

import { z } from "zod";

/** Schema for a foreign_keys row */
export const ForeignKeysSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  data_model_id: z.string().uuid(),
  name: z.string().nullable(),
  source_table_id: z.string().uuid(),
  source_columns: z.string(),
  target_table_id: z.string().uuid(),
  target_columns: z.string(),
  cardinality: z.enum(["1:1", "1:N", "N:1", "N:M"]),
  is_enforced: z.number().int(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type ForeignKeys = z.infer<typeof ForeignKeysSchema>;

/** Schema for inserting a foreign_keys row */
export const ForeignKeysInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  data_model_id: z.string().uuid(),
  name: z.string().nullable().optional(),
  source_table_id: z.string().uuid(),
  source_columns: z.string(),
  target_table_id: z.string().uuid(),
  target_columns: z.string(),
  cardinality: z.enum(["1:1", "1:N", "N:1", "N:M"]).optional(),
  is_enforced: z.number().int().optional(),
});

export type ForeignKeysInsert = z.infer<typeof ForeignKeysInsertSchema>;

/** Schema for updating a foreign_keys row */
export const ForeignKeysUpdateSchema = ForeignKeysInsertSchema.partial();

export type ForeignKeysUpdate = z.infer<typeof ForeignKeysUpdateSchema>;