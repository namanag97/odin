
/**
 * Represents a row in the oauth_tokens table
 * Source: 25_integration_layer.sql
 */
export interface OauthTokens {
  /** Primary key */
  id: string;
  integration_id: string;
  user_id: string | null;
  access_token_enc: string;
  refresh_token_enc: string | null;
  token_type: string;
  scope: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

/** Insert type for oauth_tokens (excludes auto-generated fields) */
export interface OauthTokensInsert {
  integration_id: string;
  user_id?: string | null;
  access_token_enc: string;
  refresh_token_enc?: string | null;
  token_type?: string;
  scope?: string | null;
  expires_at: string;
}