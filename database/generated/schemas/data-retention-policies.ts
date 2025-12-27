/**
 * Zod schemas for data_retention_policies table
 * Source: 24_temporal_layer.sql
 */

import { z } from "zod";

/** Schema for a data_retention_policies row */
export const DataRetentionPoliciesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid().nullable(),
  entity_type: z.string(),
  retention_days: z.number().int(),
  archive_after_days: z.number().int().nullable(),
  delete_after_archive_days: z.number().int().nullable(),
  is_active: z.number().int(),
  last_applied_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type DataRetentionPolicies = z.infer<typeof DataRetentionPoliciesSchema>;

/** Schema for inserting a data_retention_policies row */
export const DataRetentionPoliciesInsertSchema = z.object({
  tenant_id: z.string().uuid().nullable().optional(),
  entity_type: z.string(),
  retention_days: z.number().int(),
  archive_after_days: z.number().int().nullable().optional(),
  delete_after_archive_days: z.number().int().nullable().optional(),
  is_active: z.number().int().optional(),
  last_applied_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
});

export type DataRetentionPoliciesInsert = z.infer<typeof DataRetentionPoliciesInsertSchema>;

/** Schema for updating a data_retention_policies row */
export const DataRetentionPoliciesUpdateSchema = DataRetentionPoliciesInsertSchema.partial();

export type DataRetentionPoliciesUpdate = z.infer<typeof DataRetentionPoliciesUpdateSchema>;