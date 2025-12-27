export type AuditLogsActorType = "user" | "service" | "system" | "api_key";

/**
 * Represents a row in the audit_logs table
 * Source: 24_temporal_layer.sql
 */
export interface AuditLogs {
  /** Primary key */
  id: string;
  tenant_id: string;
  actor_type: AuditLogsActorType;
  actor_id: string;
  actor_email: string | null;
  action: string;
  resource_type: string;
  resource_id: string;
  resource_name: string | null;
  changes: string | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  request_id: string | null;
  created_at: string;
}

/** Insert type for audit_logs (excludes auto-generated fields) */
export interface AuditLogsInsert {
  tenant_id: string;
  actor_type: AuditLogsActorType;
  actor_id: string;
  actor_email?: string | null;
  action: string;
  resource_type: string;
  resource_id: string;
  resource_name?: string | null;
  changes?: string | null;
  metadata?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  request_id?: string | null;
}