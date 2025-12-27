export type ActionFlowWebhooksStatus = "active" | "inactive" | "expired";

/**
 * Represents a row in the action_flow_webhooks table
 * Source: 18_automation_enhanced.sql
 */
export interface ActionFlowWebhooks {
  /** Primary key */
  id: string;
  tenant_id: string;
  action_flow_id: string;
  udid: string;
  name: string;
  url: string;
  secret: string | null;
  connection_id: string | null;
  data_structure: string | null;
  get_request_headers: number;
  get_http_method: number;
  json_passthrough: number;
  /** JSON field */
  ip_allowlist: unknown[] | null;
  status: ActionFlowWebhooksStatus;
  queue_size: number | null;
  max_queue_size: number | null;
  last_called_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for action_flow_webhooks (excludes auto-generated fields) */
export interface ActionFlowWebhooksInsert {
  tenant_id: string;
  action_flow_id: string;
  udid: string;
  name: string;
  url: string;
  secret?: string | null;
  connection_id?: string | null;
  data_structure?: string | null;
  get_request_headers?: number;
  get_http_method?: number;
  json_passthrough?: number;
  ip_allowlist?: unknown[] | null;
  status?: ActionFlowWebhooksStatus;
  queue_size?: number | null;
  max_queue_size?: number | null;
  last_called_at?: string | null;
  expires_at?: string | null;
}