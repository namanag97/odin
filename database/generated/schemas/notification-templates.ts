/**
 * Zod schemas for notification_templates table
 * Source: 26_communication_layer.sql
 */

import { z } from "zod";

/** Schema for a notification_templates row */
export const NotificationTemplatesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid().nullable(),
  key: z.string(),
  name: z.string(),
  channel: z.enum(["email", "sms", "push", "in_app", "slack", "webhook"]),
  subject_template: z.string().nullable(),
  body_template: z.string(),
  body_html_template: z.string().nullable(),
  variables: z.record(z.string(), z.unknown()).nullable(),
  locale: z.string(),
  is_active: z.number().int(),
  version: z.number().int(),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type NotificationTemplates = z.infer<typeof NotificationTemplatesSchema>;

/** Schema for inserting a notification_templates row */
export const NotificationTemplatesInsertSchema = z.object({
  tenant_id: z.string().uuid().nullable().optional(),
  key: z.string(),
  name: z.string(),
  channel: z.enum(["email", "sms", "push", "in_app", "slack", "webhook"]),
  subject_template: z.string().nullable().optional(),
  body_template: z.string(),
  body_html_template: z.string().nullable().optional(),
  variables: z.record(z.string(), z.unknown()).nullable().optional(),
  locale: z.string().optional(),
  is_active: z.number().int().optional(),
  version: z.number().int().optional(),
});

export type NotificationTemplatesInsert = z.infer<typeof NotificationTemplatesInsertSchema>;

/** Schema for updating a notification_templates row */
export const NotificationTemplatesUpdateSchema = NotificationTemplatesInsertSchema.partial();

export type NotificationTemplatesUpdate = z.infer<typeof NotificationTemplatesUpdateSchema>;