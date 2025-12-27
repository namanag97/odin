
/**
 * Represents a row in the webhooks table
 * Source: 25_integration_layer.sql
 */
export interface Webhooks {
  /** Primary key */
  id: string;
  tenant_id: string;
  name: string;
  url: string;
  secret_hash: string;
  events: string;
  is_active: number;
  version: string;
  headers: string | null;
  /** JSON field */
  retry_config: Record<string, unknown> | null;
  last_triggered_at: string | null;
  failure_count: number;
  created_at: string;
}

/** Insert type for webhooks (excludes auto-generated fields) */
export interface WebhooksInsert {
  tenant_id: string;
  name: string;
  url: string;
  secret_hash: string;
  events: string;
  is_active?: number;
  version?: string;
  headers?: string | null;
  retry_config?: Record<string, unknown> | null;
  last_triggered_at?: string | null;
  failure_count?: number;
}