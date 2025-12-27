/**
 * Environment Repository Interface - Existence Layer
 * 
 * Data access contract for Environment entities.
 */

import type { 
  TenantId,
  UUID,
  AsyncResult,
  PageRequest,
  PageResponse
} from '@odin/core-contracts';

import type { 
  Environment,
  EnvironmentType,
  CreateEnvironmentData, 
  UpdateEnvironmentData 
} from '../../entities/existence/environment';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * IEnvironmentRepository - Environment data access contract
 */
export interface IEnvironmentRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find an environment by ID
   */
  findById(id: UUID): AsyncResult<Environment | null>;
  
  /**
   * Find environments by tenant
   */
  findByTenantId(tenantId: TenantId, options?: PageRequest): AsyncResult<PageResponse<Environment>>;
  
  /**
   * Find environments by type
   */
  findByType(tenantId: TenantId, type: EnvironmentType): AsyncResult<readonly Environment[]>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new environment
   */
  create(data: CreateEnvironmentData): AsyncResult<Environment>;
  
  /**
   * Update environment fields
   */
  update(id: UUID, data: UpdateEnvironmentData): AsyncResult<Environment>;
  
  /**
   * Delete an environment
   */
  delete(id: UUID): AsyncResult<void>;
  
  /**
   * Promote an environment (copy config from another)
   */
  promote(sourceId: UUID, targetType: EnvironmentType): AsyncResult<Environment>;
}
