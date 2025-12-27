export type EmailMessagesStatus = "queued" | "sent" | "delivered" | "bounced" | "complained" | "failed";

/**
 * Represents a row in the email_messages table
 * Source: 26_communication_layer.sql
 */
export interface EmailMessages {
  /** Primary key */
  id: string;
  tenant_id: string;
  notification_id: string | null;
  from_address: string;
  to_addresses: string;
  cc_addresses: string | null;
  bcc_addresses: string | null;
  subject: string;
  body_text: string | null;
  body_html: string | null;
  status: EmailMessagesStatus;
  provider: string;
  provider_message_id: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  sent_at: string | null;
  created_at: string;
}

/** Insert type for email_messages (excludes auto-generated fields) */
export interface EmailMessagesInsert {
  tenant_id: string;
  notification_id?: string | null;
  from_address: string;
  to_addresses: string;
  cc_addresses?: string | null;
  bcc_addresses?: string | null;
  subject: string;
  body_text?: string | null;
  body_html?: string | null;
  status?: EmailMessagesStatus;
  provider: string;
  provider_message_id?: string | null;
  opened_at?: string | null;
  clicked_at?: string | null;
  sent_at?: string | null;
}