/**
 * Zod schemas for augmented_attribute_values table
 * Source: 16_semantic.sql
 */

import { z } from "zod";

/** Schema for a augmented_attribute_values row */
export const AugmentedAttributeValuesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  augmented_attribute_id: z.string().uuid(),
  record_key: z.string(),
  value: z.string(),
  updated_by: z.string(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type AugmentedAttributeValues = z.infer<typeof AugmentedAttributeValuesSchema>;

/** Schema for inserting a augmented_attribute_values row */
export const AugmentedAttributeValuesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  augmented_attribute_id: z.string().uuid(),
  record_key: z.string(),
  value: z.string(),
  updated_by: z.string(),
});

export type AugmentedAttributeValuesInsert = z.infer<typeof AugmentedAttributeValuesInsertSchema>;

/** Schema for updating a augmented_attribute_values row */
export const AugmentedAttributeValuesUpdateSchema = AugmentedAttributeValuesInsertSchema.partial();

export type AugmentedAttributeValuesUpdate = z.infer<typeof AugmentedAttributeValuesUpdateSchema>;