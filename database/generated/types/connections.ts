export type ConnectionsConnectionType = "oauth2" | "api_key" | "basic" | "celonis_user" | "celonis_app_key" | "custom";
export type ConnectionsStatus = "valid" | "invalid" | "expired" | "revoked";

/**
 * Represents a row in the connections table
 * Source: 18_automation_enhanced.sql
 */
export interface Connections {
  /** Primary key */
  id: string;
  tenant_id: string;
  package_id: string | null;
  name: string;
  app_name: string;
  connection_type: ConnectionsConnectionType;
  credentials: string;
  oauth_credentials_id: string | null;
  status: ConnectionsStatus;
  is_dynamic: number;
  last_used_at: string | null;
  last_tested_at: string | null;
  expires_at: string | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for connections (excludes auto-generated fields) */
export interface ConnectionsInsert {
  tenant_id: string;
  package_id?: string | null;
  name: string;
  app_name: string;
  connection_type: ConnectionsConnectionType;
  credentials: string;
  oauth_credentials_id?: string | null;
  status?: ConnectionsStatus;
  is_dynamic?: number;
  last_used_at?: string | null;
  last_tested_at?: string | null;
  expires_at?: string | null;
  metadata?: Record<string, unknown> | null;
  created_by?: string | null;
}