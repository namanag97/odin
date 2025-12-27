
/**
 * Represents a row in the api_keys table
 * Source: 25_integration_layer.sql
 */
export interface ApiKeys {
  /** Primary key */
  id: string;
  tenant_id: string;
  environment_id: string | null;
  created_by: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  /** JSON field */
  scopes: unknown[] | null;
  rate_limit: number | null;
  allowed_ips: string | null;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

/** Insert type for api_keys (excludes auto-generated fields) */
export interface ApiKeysInsert {
  tenant_id: string;
  environment_id?: string | null;
  created_by: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  scopes?: unknown[] | null;
  rate_limit?: number | null;
  allowed_ips?: string | null;
  last_used_at?: string | null;
  expires_at?: string | null;
  revoked_at?: string | null;
}