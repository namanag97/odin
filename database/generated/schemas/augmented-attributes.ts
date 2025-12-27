/**
 * Zod schemas for augmented_attributes table
 * Source: 16_semantic.sql
 */

import { z } from "zod";

/** Schema for a augmented_attributes row */
export const AugmentedAttributesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  record_id: z.string().uuid(),
  key: z.string(),
  display_name: z.string().nullable(),
  description: z.string().nullable(),
  data_type: z.enum(["string", "number", "date", "boolean", "enum"]),
  possible_values: z.string().nullable(),
  default_value: z.string().nullable(),
  is_required: z.number().int(),
  is_multi_value: z.number().int(),
  validation_regex: z.string().nullable(),
  ordinal_position: z.number().int().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type AugmentedAttributes = z.infer<typeof AugmentedAttributesSchema>;

/** Schema for inserting a augmented_attributes row */
export const AugmentedAttributesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  record_id: z.string().uuid(),
  key: z.string(),
  display_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  data_type: z.enum(["string", "number", "date", "boolean", "enum"]),
  possible_values: z.string().nullable().optional(),
  default_value: z.string().nullable().optional(),
  is_required: z.number().int().optional(),
  is_multi_value: z.number().int().optional(),
  validation_regex: z.string().nullable().optional(),
  ordinal_position: z.number().int().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type AugmentedAttributesInsert = z.infer<typeof AugmentedAttributesInsertSchema>;

/** Schema for updating a augmented_attributes row */
export const AugmentedAttributesUpdateSchema = AugmentedAttributesInsertSchema.partial();

export type AugmentedAttributesUpdate = z.infer<typeof AugmentedAttributesUpdateSchema>;