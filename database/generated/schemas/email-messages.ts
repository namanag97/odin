/**
 * Zod schemas for email_messages table
 * Source: 26_communication_layer.sql
 */

import { z } from "zod";

/** Schema for a email_messages row */
export const EmailMessagesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  notification_id: z.string().uuid().nullable(),
  from_address: z.string(),
  to_addresses: z.string(),
  cc_addresses: z.string().nullable(),
  bcc_addresses: z.string().nullable(),
  subject: z.string(),
  body_text: z.string().nullable(),
  body_html: z.string().nullable(),
  status: z.enum(["queued", "sent", "delivered", "bounced", "complained", "failed"]),
  provider: z.string(),
  provider_message_id: z.string().uuid().nullable(),
  opened_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  clicked_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  sent_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type EmailMessages = z.infer<typeof EmailMessagesSchema>;

/** Schema for inserting a email_messages row */
export const EmailMessagesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  notification_id: z.string().uuid().nullable().optional(),
  from_address: z.string(),
  to_addresses: z.string(),
  cc_addresses: z.string().nullable().optional(),
  bcc_addresses: z.string().nullable().optional(),
  subject: z.string(),
  body_text: z.string().nullable().optional(),
  body_html: z.string().nullable().optional(),
  status: z.enum(["queued", "sent", "delivered", "bounced", "complained", "failed"]).optional(),
  provider: z.string(),
  provider_message_id: z.string().uuid().nullable().optional(),
  opened_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  clicked_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  sent_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
});

export type EmailMessagesInsert = z.infer<typeof EmailMessagesInsertSchema>;

/** Schema for updating a email_messages row */
export const EmailMessagesUpdateSchema = EmailMessagesInsertSchema.partial();

export type EmailMessagesUpdate = z.infer<typeof EmailMessagesUpdateSchema>;