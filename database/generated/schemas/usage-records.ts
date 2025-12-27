/**
 * Zod schemas for usage_records table
 * Source: 22_commercial_layer.sql
 */

import { z } from "zod";

/** Schema for a usage_records row */
export const UsageRecordsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  subscription_id: z.string().uuid(),
  resource_type: z.string(),
  quantity: z.number(),
  unit: z.string(),
  timestamp: z.string().datetime({ offset: true }).or(z.string()),
  idempotency_key: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
});

export type UsageRecords = z.infer<typeof UsageRecordsSchema>;

/** Schema for inserting a usage_records row */
export const UsageRecordsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  subscription_id: z.string().uuid(),
  resource_type: z.string(),
  quantity: z.number(),
  unit: z.string(),
  timestamp: z.string().datetime({ offset: true }).or(z.string()).optional(),
  idempotency_key: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type UsageRecordsInsert = z.infer<typeof UsageRecordsInsertSchema>;

/** Schema for updating a usage_records row */
export const UsageRecordsUpdateSchema = UsageRecordsInsertSchema.partial();

export type UsageRecordsUpdate = z.infer<typeof UsageRecordsUpdateSchema>;