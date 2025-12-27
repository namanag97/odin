export type IdentityProvidersType = "saml" | "oidc" | "ldap" | "oauth2";

/**
 * Represents a row in the identity_providers table
 * Source: 21_identity_layer.sql
 */
export interface IdentityProviders {
  /** Primary key */
  id: string;
  tenant_id: string;
  name: string;
  type: IdentityProvidersType;
  is_enabled: number;
  is_default: number;
  /** JSON field */
  config_encrypted: Record<string, unknown>;
  /** JSON field */
  metadata_url: Record<string, unknown> | null;
  domain_hints: string | null;
  auto_provision: number;
  default_role_id: string | null;
  created_at: string;
}

/** Insert type for identity_providers (excludes auto-generated fields) */
export interface IdentityProvidersInsert {
  tenant_id: string;
  name: string;
  type: IdentityProvidersType;
  is_enabled?: number;
  is_default?: number;
  config_encrypted: Record<string, unknown>;
  metadata_url?: Record<string, unknown> | null;
  domain_hints?: string | null;
  auto_provision?: number;
  default_role_id?: string | null;
}