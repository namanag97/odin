/**
 * OAuthToken Repository Interface - Integration Layer
 * 
 * Data access contract for OAuthToken entities.
 */

import type { 
  UUID, 
  AsyncResult
} from '@odin/core-contracts';

import type { 
  OAuthToken,
  CreateOAuthTokenData,
  RefreshTokenData
} from '../../entities/integration/oauth-token';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * IOAuthTokenRepository - OAuth token data access contract
 */
export interface IOAuthTokenRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find token by integration ID
   */
  findByIntegrationId(integrationId: UUID): AsyncResult<OAuthToken | null>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Store a new OAuth token
   */
  store(data: CreateOAuthTokenData): AsyncResult<OAuthToken>;
  
  /**
   * Refresh an OAuth token
   */
  refresh(id: UUID, newTokens: RefreshTokenData): AsyncResult<OAuthToken>;
  
  /**
   * Revoke an OAuth token
   */
  revoke(id: UUID): AsyncResult<void>;

  // -------------------------------------------------------------------------
  // Maintenance
  // -------------------------------------------------------------------------
  
  /**
   * Find tokens expiring within a time window
   */
  findExpiring(withinMinutes: number): AsyncResult<readonly OAuthToken[]>;
  
  /**
   * Delete expired tokens
   */
  deleteExpired(): AsyncResult<number>;
}
