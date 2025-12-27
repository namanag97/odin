export type NotificationsChannel = "email" | "sms" | "push" | "in_app" | "slack";
export type NotificationsPriority = "low" | "normal" | "high" | "urgent";
export type NotificationsStatus = "pending" | "sent" | "delivered" | "failed" | "read";

/**
 * Represents a row in the notifications table
 * Source: 26_communication_layer.sql
 */
export interface Notifications {
  /** Primary key */
  id: string;
  tenant_id: string;
  user_id: string;
  template_id: string | null;
  channel: NotificationsChannel;
  type: string;
  title: string;
  body: string;
  data: string | null;
  action_url: string | null;
  priority: NotificationsPriority;
  status: NotificationsStatus;
  read_at: string | null;
  sent_at: string | null;
  error: string | null;
  created_at: string;
}

/** Insert type for notifications (excludes auto-generated fields) */
export interface NotificationsInsert {
  tenant_id: string;
  user_id: string;
  template_id?: string | null;
  channel: NotificationsChannel;
  type: string;
  title: string;
  body: string;
  data?: string | null;
  action_url?: string | null;
  priority?: NotificationsPriority;
  status?: NotificationsStatus;
  read_at?: string | null;
  sent_at?: string | null;
  error?: string | null;
}