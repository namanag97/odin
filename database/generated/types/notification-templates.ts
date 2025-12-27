export type NotificationTemplatesChannel = "email" | "sms" | "push" | "in_app" | "slack" | "webhook";

/**
 * Represents a row in the notification_templates table
 * Source: 26_communication_layer.sql
 */
export interface NotificationTemplates {
  /** Primary key */
  id: string;
  tenant_id: string | null;
  key: string;
  name: string;
  channel: NotificationTemplatesChannel;
  subject_template: string | null;
  body_template: string;
  body_html_template: string | null;
  /** JSON field */
  variables: Record<string, unknown> | null;
  locale: string;
  is_active: number;
  version: number;
  updated_at: string;
}

/** Insert type for notification_templates (excludes auto-generated fields) */
export interface NotificationTemplatesInsert {
  tenant_id?: string | null;
  key: string;
  name: string;
  channel: NotificationTemplatesChannel;
  subject_template?: string | null;
  body_template: string;
  body_html_template?: string | null;
  variables?: Record<string, unknown> | null;
  locale?: string;
  is_active?: number;
  version?: number;
}