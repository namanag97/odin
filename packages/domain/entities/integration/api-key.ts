/**
 * ApiKey Entity - Integration Layer
 * 
 * API key management for programmatic access.
 */

import type { 
  UUID, 
  TenantId, 
  UserId, 
  ISODateTime,
  EntityStatus
} from '@odin/core-contracts';

// ============================================================================
// Scope Types
// ============================================================================

/** Available API scopes */
export type ApiScope = 
  | 'read:data_pools' 
  | 'write:data_pools'
  | 'read:data_models' 
  | 'write:data_models'
  | 'read:views' 
  | 'write:views'
  | 'execute:action_flows'
  | 'read:analytics'
  | 'admin';

// ============================================================================
// Entity
// ============================================================================

/**
 * ApiKey - Programmatic access credentials
 */
export interface ApiKey {
  readonly id: UUID;
  readonly tenantId: TenantId;
  /** Owner of the API key */
  readonly userId: UserId;
  readonly name: string;
  /** Hashed key (never stored in plain text) */
  readonly keyHash: string;
  /** First 8 characters for identification */
  readonly keyPrefix: string;
  readonly scopes: readonly ApiScope[];
  /** Rate limit override (requests per minute) */
  readonly rateLimit?: number;
  readonly status: EntityStatus;
  readonly lastUsedAt?: ISODateTime;
  readonly expiresAt?: ISODateTime;
  readonly createdAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create an API key
 */
export interface CreateApiKeyData {
  readonly tenantId: TenantId;
  readonly userId: UserId;
  readonly name: string;
  readonly scopes: readonly ApiScope[];
  readonly rateLimit?: number;
  readonly expiresAt?: ISODateTime;
}

/**
 * Data for updating an API key
 */
export interface UpdateApiKeyData {
  readonly name?: string;
  readonly scopes?: readonly ApiScope[];
  readonly rateLimit?: number;
  readonly status?: EntityStatus;
  readonly expiresAt?: ISODateTime;
}
