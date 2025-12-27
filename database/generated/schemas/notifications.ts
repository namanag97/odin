/**
 * Zod schemas for notifications table
 * Source: 26_communication_layer.sql
 */

import { z } from "zod";

/** Schema for a notifications row */
export const NotificationsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  template_id: z.string().uuid().nullable(),
  channel: z.enum(["email", "sms", "push", "in_app", "slack"]),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  data: z.string().nullable(),
  action_url: z.string().nullable(),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  status: z.enum(["pending", "sent", "delivered", "failed", "read"]),
  read_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  sent_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  error: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Notifications = z.infer<typeof NotificationsSchema>;

/** Schema for inserting a notifications row */
export const NotificationsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  template_id: z.string().uuid().nullable().optional(),
  channel: z.enum(["email", "sms", "push", "in_app", "slack"]),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  data: z.string().nullable().optional(),
  action_url: z.string().nullable().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  status: z.enum(["pending", "sent", "delivered", "failed", "read"]).optional(),
  read_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  sent_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  error: z.string().nullable().optional(),
});

export type NotificationsInsert = z.infer<typeof NotificationsInsertSchema>;

/** Schema for updating a notifications row */
export const NotificationsUpdateSchema = NotificationsInsertSchema.partial();

export type NotificationsUpdate = z.infer<typeof NotificationsUpdateSchema>;