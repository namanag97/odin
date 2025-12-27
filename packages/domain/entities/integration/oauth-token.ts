/**
 * OAuthToken Entity - Integration Layer
 * 
 * OAuth token management for integrations.
 */

import type { 
  UUID, 
  ISODateTime
} from '@odin/core-contracts';

// ============================================================================
// Entity
// ============================================================================

/**
 * OAuthToken - OAuth credentials for an integration
 */
export interface OAuthToken {
  readonly id: UUID;
  readonly integrationId: UUID;
  readonly provider: string;
  readonly accessTokenEncrypted: string;
  readonly refreshTokenEncrypted?: string;
  readonly tokenType: string;
  readonly scopes: readonly string[];
  readonly expiresAt: ISODateTime;
  readonly refreshedAt?: ISODateTime;
  readonly createdAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to store an OAuth token
 */
export interface CreateOAuthTokenData {
  readonly integrationId: UUID;
  readonly provider: string;
  readonly accessTokenEncrypted: string;
  readonly refreshTokenEncrypted?: string;
  readonly tokenType: string;
  readonly scopes: readonly string[];
  readonly expiresAt: ISODateTime;
}

/**
 * Data for refreshing an OAuth token
 */
export interface RefreshTokenData {
  readonly accessTokenEncrypted: string;
  readonly refreshTokenEncrypted?: string;
  readonly expiresAt: ISODateTime;
}
