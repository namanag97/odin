export type UserCredentialsProvider = "email" | "google" | "microsoft" | "saml" | "oidc" | "ldap";

/**
 * Represents a row in the user_credentials table
 * Source: 21_identity_layer.sql
 */
export interface UserCredentials {
  /** Primary key */
  id: string;
  user_id: string;
  provider: UserCredentialsProvider;
  provider_user_id: string;
  access_token_enc: string | null;
  refresh_token_enc: string | null;
  token_expires_at: string | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for user_credentials (excludes auto-generated fields) */
export interface UserCredentialsInsert {
  user_id: string;
  provider: UserCredentialsProvider;
  provider_user_id: string;
  access_token_enc?: string | null;
  refresh_token_enc?: string | null;
  token_expires_at?: string | null;
  metadata?: Record<string, unknown> | null;
}