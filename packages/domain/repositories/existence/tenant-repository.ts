/**
 * Tenant Repository Interface - Existence Layer
 * 
 * Data access contract for Tenant entities.
 */

import type { 
  TenantId,
  AsyncResult,
  PageRequest,
  PageResponse
} from '@odin/core-contracts';

import type { 
  Tenant, 
  TenantStatus, 
  TenantSettings,
  CreateTenantData, 
  UpdateTenantData 
} from '../../entities/existence/tenant';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * ITenantRepository - Tenant data access contract
 */
export interface ITenantRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find a tenant by ID
   */
  findById(id: TenantId): AsyncResult<Tenant | null>;
  
  /**
   * Find a tenant by slug
   */
  findBySlug(slug: string): AsyncResult<Tenant | null>;
  
  /**
   * Find all tenants with pagination
   */
  findAll(options?: PageRequest): AsyncResult<PageResponse<Tenant>>;
  
  /**
   * Check if a tenant exists
   */
  exists(id: TenantId): AsyncResult<boolean>;
  
  /**
   * Check if a slug is available
   */
  slugExists(slug: string): AsyncResult<boolean>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new tenant
   */
  create(data: CreateTenantData): AsyncResult<Tenant>;
  
  /**
   * Update tenant fields
   */
  update(id: TenantId, data: UpdateTenantData): AsyncResult<Tenant>;
  
  /**
   * Update tenant status
   */
  updateStatus(id: TenantId, status: TenantStatus): AsyncResult<Tenant>;
  
  /**
   * Update tenant settings (partial merge)
   */
  updateSettings(id: TenantId, settings: Partial<TenantSettings>): AsyncResult<Tenant>;
  
  /**
   * Soft delete a tenant (sets deletedAt)
   */
  softDelete(id: TenantId): AsyncResult<void>;
  
  /**
   * Hard delete a tenant (permanent removal)
   */
  hardDelete(id: TenantId): AsyncResult<void>;
}
