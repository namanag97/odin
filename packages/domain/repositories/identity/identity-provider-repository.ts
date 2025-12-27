/**
 * Identity Provider Repository Interface - Identity Layer
 * 
 * Data access contract for IdentityProvider entities.
 */

import type { 
  TenantId,
  UUID,
  AsyncResult
} from '@odin/core-contracts';

import type { 
  IdentityProvider,
  IdPType,
  CreateIdentityProviderData, 
  UpdateIdentityProviderData 
} from '../../entities/identity/identity-provider';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * IIdentityProviderRepository - Identity Provider data access contract
 */
export interface IIdentityProviderRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find an identity provider by ID
   */
  findById(id: UUID): AsyncResult<IdentityProvider | null>;
  
  /**
   * Find identity providers by tenant
   */
  findByTenantId(tenantId: TenantId): AsyncResult<readonly IdentityProvider[]>;
  
  /**
   * Find identity providers by type
   */
  findByType(tenantId: TenantId, type: IdPType): AsyncResult<readonly IdentityProvider[]>;
  
  /**
   * Find identity provider by domain
   */
  findByDomain(domain: string): AsyncResult<IdentityProvider | null>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new identity provider
   */
  create(data: CreateIdentityProviderData): AsyncResult<IdentityProvider>;
  
  /**
   * Update identity provider fields
   */
  update(id: UUID, data: UpdateIdentityProviderData): AsyncResult<IdentityProvider>;
  
  /**
   * Delete an identity provider
   */
  delete(id: UUID): AsyncResult<void>;
}
