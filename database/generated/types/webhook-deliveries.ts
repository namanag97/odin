export type WebhookDeliveriesStatus = "pending" | "success" | "failure" | "retrying";

/**
 * Represents a row in the webhook_deliveries table
 * Source: 25_integration_layer.sql
 */
export interface WebhookDeliveries {
  /** Primary key */
  id: string;
  webhook_id: string;
  event_type: string;
  payload: string;
  status: WebhookDeliveriesStatus;
  attempts: number;
  response_status: number | null;
  response_body: string | null;
  error: string | null;
  next_retry_at: string | null;
  created_at: string;
  delivered_at: string | null;
}

/** Insert type for webhook_deliveries (excludes auto-generated fields) */
export interface WebhookDeliveriesInsert {
  webhook_id: string;
  event_type: string;
  payload: string;
  status?: WebhookDeliveriesStatus;
  attempts?: number;
  response_status?: number | null;
  response_body?: string | null;
  error?: string | null;
  next_retry_at?: string | null;
  delivered_at?: string | null;
}