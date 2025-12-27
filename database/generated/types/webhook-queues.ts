export type WebhookQueuesStatus = "pending" | "processing" | "processed" | "failed";

/**
 * Represents a row in the webhook_queues table
 * Source: 18_automation_enhanced.sql
 */
export interface WebhookQueues {
  /** Primary key */
  id: string;
  tenant_id: string;
  webhook_id: string;
  payload: string;
  /** JSON field */
  headers: Record<string, unknown> | null;
  http_method: string | null;
  source_ip: string | null;
  status: WebhookQueuesStatus;
  processed_at: string | null;
  error_message: string | null;
  retry_count: number | null;
  created_at: string;
}

/** Insert type for webhook_queues (excludes auto-generated fields) */
export interface WebhookQueuesInsert {
  tenant_id: string;
  webhook_id: string;
  payload: string;
  headers?: Record<string, unknown> | null;
  http_method?: string | null;
  source_ip?: string | null;
  status?: WebhookQueuesStatus;
  processed_at?: string | null;
  error_message?: string | null;
  retry_count?: number | null;
}