/**
 * Zod schemas for webhook_queues table
 * Source: 18_automation_enhanced.sql
 */

import { z } from "zod";

/** Schema for a webhook_queues row */
export const WebhookQueuesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  webhook_id: z.string().uuid(),
  payload: z.string(),
  headers: z.record(z.string(), z.unknown()).nullable(),
  http_method: z.string().nullable(),
  source_ip: z.string().nullable(),
  status: z.enum(["pending", "processing", "processed", "failed"]),
  processed_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  error_message: z.string().nullable(),
  retry_count: z.number().int().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type WebhookQueues = z.infer<typeof WebhookQueuesSchema>;

/** Schema for inserting a webhook_queues row */
export const WebhookQueuesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  webhook_id: z.string().uuid(),
  payload: z.string(),
  headers: z.record(z.string(), z.unknown()).nullable().optional(),
  http_method: z.string().nullable().optional(),
  source_ip: z.string().nullable().optional(),
  status: z.enum(["pending", "processing", "processed", "failed"]).optional(),
  processed_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  error_message: z.string().nullable().optional(),
  retry_count: z.number().int().nullable().optional(),
});

export type WebhookQueuesInsert = z.infer<typeof WebhookQueuesInsertSchema>;

/** Schema for updating a webhook_queues row */
export const WebhookQueuesUpdateSchema = WebhookQueuesInsertSchema.partial();

export type WebhookQueuesUpdate = z.infer<typeof WebhookQueuesUpdateSchema>;