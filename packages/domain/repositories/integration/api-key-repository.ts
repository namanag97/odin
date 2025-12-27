/**
 * ApiKey Repository Interface - Integration Layer
 * 
 * Data access contract for ApiKey entities.
 */

import type { 
  UUID, 
  TenantId, 
  UserId, 
  AsyncResult
} from '@odin/core-contracts';

import type { 
  ApiKey,
  CreateApiKeyData,
  UpdateApiKeyData
} from '../../entities/integration/api-key';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * IApiKeyRepository - API key data access contract
 */
export interface IApiKeyRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find an API key by ID
   */
  findById(id: UUID): AsyncResult<ApiKey | null>;
  
  /**
   * Find an API key by its hash
   */
  findByKeyHash(keyHash: string): AsyncResult<ApiKey | null>;
  
  /**
   * Find all API keys for a tenant
   */
  findByTenantId(tenantId: TenantId): AsyncResult<readonly ApiKey[]>;
  
  /**
   * Find all API keys for a user
   */
  findByUserId(userId: UserId): AsyncResult<readonly ApiKey[]>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new API key
   * Returns both the key entity and the plain key (only returned once)
   */
  create(data: CreateApiKeyData): AsyncResult<{ apiKey: ApiKey; plainKey: string }>;
  
  /**
   * Update an API key
   */
  update(id: UUID, data: UpdateApiKeyData): AsyncResult<ApiKey>;
  
  /**
   * Revoke an API key
   */
  revoke(id: UUID): AsyncResult<void>;
  
  /**
   * Update last used timestamp
   */
  updateLastUsed(id: UUID): AsyncResult<void>;

  // -------------------------------------------------------------------------
  // Maintenance
  // -------------------------------------------------------------------------
  
  /**
   * Delete expired API keys
   */
  deleteExpired(): AsyncResult<number>;
  
  /**
   * Rotate an API key (create new key, invalidate old)
   * Returns both the updated key entity and the new plain key
   */
  rotateKey(id: UUID): AsyncResult<{ apiKey: ApiKey; plainKey: string }>;
}
