/**
 * Zod schemas for action_flow_webhooks table
 * Source: 18_automation_enhanced.sql
 */

import { z } from "zod";

/** Schema for a action_flow_webhooks row */
export const ActionFlowWebhooksSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  action_flow_id: z.string().uuid(),
  udid: z.string(),
  name: z.string(),
  url: z.string(),
  secret: z.string().nullable(),
  connection_id: z.string().uuid().nullable(),
  data_structure: z.string().nullable(),
  get_request_headers: z.number().int(),
  get_http_method: z.number().int(),
  json_passthrough: z.number().int(),
  ip_allowlist: z.array(z.unknown()).nullable(),
  status: z.enum(["active", "inactive", "expired"]),
  queue_size: z.number().int().nullable(),
  max_queue_size: z.number().int().nullable(),
  last_called_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  expires_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type ActionFlowWebhooks = z.infer<typeof ActionFlowWebhooksSchema>;

/** Schema for inserting a action_flow_webhooks row */
export const ActionFlowWebhooksInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  action_flow_id: z.string().uuid(),
  udid: z.string(),
  name: z.string(),
  url: z.string(),
  secret: z.string().nullable().optional(),
  connection_id: z.string().uuid().nullable().optional(),
  data_structure: z.string().nullable().optional(),
  get_request_headers: z.number().int().optional(),
  get_http_method: z.number().int().optional(),
  json_passthrough: z.number().int().optional(),
  ip_allowlist: z.array(z.unknown()).nullable().optional(),
  status: z.enum(["active", "inactive", "expired"]).optional(),
  queue_size: z.number().int().nullable().optional(),
  max_queue_size: z.number().int().nullable().optional(),
  last_called_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  expires_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
});

export type ActionFlowWebhooksInsert = z.infer<typeof ActionFlowWebhooksInsertSchema>;

/** Schema for updating a action_flow_webhooks row */
export const ActionFlowWebhooksUpdateSchema = ActionFlowWebhooksInsertSchema.partial();

export type ActionFlowWebhooksUpdate = z.infer<typeof ActionFlowWebhooksUpdateSchema>;