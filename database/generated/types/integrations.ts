export type IntegrationsType = "oauth" | "api_key" | "webhook" | "custom";
export type IntegrationsStatus = "pending" | "active" | "error" | "disabled";

/**
 * Represents a row in the integrations table
 * Source: 25_integration_layer.sql
 */
export interface Integrations {
  /** Primary key */
  id: string;
  tenant_id: string;
  provider: string;
  name: string;
  type: IntegrationsType;
  status: IntegrationsStatus;
  /** JSON field */
  config_encrypted: Record<string, unknown>;
  credentials_encrypted: string | null;
  scopes: string | null;
  last_sync_at: string | null;
  sync_status: string | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for integrations (excludes auto-generated fields) */
export interface IntegrationsInsert {
  tenant_id: string;
  provider: string;
  name: string;
  type: IntegrationsType;
  status?: IntegrationsStatus;
  config_encrypted: Record<string, unknown>;
  credentials_encrypted?: string | null;
  scopes?: string | null;
  last_sync_at?: string | null;
  sync_status?: string | null;
  metadata?: Record<string, unknown> | null;
}