/**
 * Zod schemas for webhooks table
 * Source: 25_integration_layer.sql
 */

import { z } from "zod";

/** Schema for a webhooks row */
export const WebhooksSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  url: z.string(),
  secret_hash: z.string(),
  events: z.string(),
  is_active: z.number().int(),
  version: z.string(),
  headers: z.string().nullable(),
  retry_config: z.record(z.string(), z.unknown()).nullable(),
  last_triggered_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  failure_count: z.number().int(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Webhooks = z.infer<typeof WebhooksSchema>;

/** Schema for inserting a webhooks row */
export const WebhooksInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string(),
  url: z.string(),
  secret_hash: z.string(),
  events: z.string(),
  is_active: z.number().int().optional(),
  version: z.string().optional(),
  headers: z.string().nullable().optional(),
  retry_config: z.record(z.string(), z.unknown()).nullable().optional(),
  last_triggered_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  failure_count: z.number().int().optional(),
});

export type WebhooksInsert = z.infer<typeof WebhooksInsertSchema>;

/** Schema for updating a webhooks row */
export const WebhooksUpdateSchema = WebhooksInsertSchema.partial();

export type WebhooksUpdate = z.infer<typeof WebhooksUpdateSchema>;