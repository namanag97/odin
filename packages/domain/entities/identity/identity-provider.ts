/**
 * Identity Provider Entity - Identity Layer
 * 
 * SSO/SAML/OIDC configuration for enterprise authentication.
 */

import type { 
  TenantId, 
  UUID,
  URL,
  ISODateTime,
  EntityStatus
} from '@odin/core-contracts';

// ============================================================================
// Types
// ============================================================================

/** Identity provider type */
export type IdPType = 'saml' | 'oidc' | 'google' | 'microsoft' | 'okta';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Attribute mapping from IdP to user fields
 */
export interface AttributeMapping {
  readonly email: string;
  readonly name?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly groups?: string;
}

/**
 * Identity provider configuration
 */
export interface IdPConfig {
  readonly clientId: string;
  readonly clientSecretEncrypted: string;
  readonly issuerUrl?: URL;
  readonly authorizationUrl?: URL;
  readonly tokenUrl?: URL;
  readonly userInfoUrl?: URL;
  readonly scopes: readonly string[];
  readonly attributeMapping: AttributeMapping;
}

/**
 * Identity provider metadata
 */
export interface IdPMetadata {
  readonly lastSyncAt?: ISODateTime;
  readonly userCount?: number;
  readonly domainVerified: boolean;
  readonly domains: readonly string[];
}

// ============================================================================
// Entity
// ============================================================================

/**
 * IdentityProvider - External authentication source
 */
export interface IdentityProvider {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly type: IdPType;
  readonly status: EntityStatus;
  readonly config: IdPConfig;
  readonly metadata: IdPMetadata;
  readonly createdAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create an identity provider
 */
export interface CreateIdentityProviderData {
  readonly tenantId: TenantId;
  readonly name: string;
  readonly type: IdPType;
  readonly config: IdPConfig;
}

/**
 * Data for updating an identity provider
 */
export interface UpdateIdentityProviderData {
  readonly name?: string;
  readonly config?: Partial<IdPConfig>;
  readonly metadata?: Partial<IdPMetadata>;
}
