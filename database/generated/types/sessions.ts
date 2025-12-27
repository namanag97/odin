
/**
 * Represents a row in the sessions table
 * Source: 21_identity_layer.sql
 */
export interface Sessions {
  /** Primary key */
  id: string;
  user_id: string;
  token_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  device_fingerprint: string | null;
  location: string | null;
  created_at: string;
  expires_at: string;
  last_active_at: string;
  revoked_at: string | null;
}

/** Insert type for sessions (excludes auto-generated fields) */
export interface SessionsInsert {
  user_id: string;
  token_hash: string;
  ip_address?: string | null;
  user_agent?: string | null;
  device_fingerprint?: string | null;
  location?: string | null;
  expires_at: string;
  last_active_at?: string;
  revoked_at?: string | null;
}