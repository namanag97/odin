/**
 * Zod schemas for webhook_deliveries table
 * Source: 25_integration_layer.sql
 */

import { z } from "zod";

/** Schema for a webhook_deliveries row */
export const WebhookDeliveriesSchema = z.object({
  id: z.string().uuid(),
  webhook_id: z.string().uuid(),
  event_type: z.string(),
  payload: z.string(),
  status: z.enum(["pending", "success", "failure", "retrying"]),
  attempts: z.number().int(),
  response_status: z.number().int().nullable(),
  response_body: z.string().nullable(),
  error: z.string().nullable(),
  next_retry_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  delivered_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
});

export type WebhookDeliveries = z.infer<typeof WebhookDeliveriesSchema>;

/** Schema for inserting a webhook_deliveries row */
export const WebhookDeliveriesInsertSchema = z.object({
  webhook_id: z.string().uuid(),
  event_type: z.string(),
  payload: z.string(),
  status: z.enum(["pending", "success", "failure", "retrying"]).optional(),
  attempts: z.number().int().optional(),
  response_status: z.number().int().nullable().optional(),
  response_body: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  next_retry_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  delivered_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
});

export type WebhookDeliveriesInsert = z.infer<typeof WebhookDeliveriesInsertSchema>;

/** Schema for updating a webhook_deliveries row */
export const WebhookDeliveriesUpdateSchema = WebhookDeliveriesInsertSchema.partial();

export type WebhookDeliveriesUpdate = z.infer<typeof WebhookDeliveriesUpdateSchema>;