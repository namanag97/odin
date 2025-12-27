/**
 * Integration Repository Interface - Integration Layer
 * 
 * Data access contract for Integration entities.
 */

import type { 
  UUID, 
  TenantId, 
  AsyncResult,
  PageRequest,
  PageResponse
} from '@odin/core-contracts';

import type { 
  Integration,
  IntegrationType,
  IntegrationStatus,
  HealthStatus,
  CreateIntegrationData,
  UpdateIntegrationData
} from '../../entities/integration/integration';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * IIntegrationRepository - Integration data access contract
 */
export interface IIntegrationRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find an integration by ID
   */
  findById(id: UUID): AsyncResult<Integration | null>;
  
  /**
   * Find integrations by tenant
   */
  findByTenantId(
    tenantId: TenantId, 
    options?: PageRequest
  ): AsyncResult<PageResponse<Integration>>;
  
  /**
   * Find integrations by type
   */
  findByType(
    tenantId: TenantId, 
    type: IntegrationType
  ): AsyncResult<readonly Integration[]>;
  
  /**
   * Find integrations by status
   */
  findByStatus(
    tenantId: TenantId, 
    status: IntegrationStatus
  ): AsyncResult<readonly Integration[]>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new integration
   */
  create(data: CreateIntegrationData): AsyncResult<Integration>;
  
  /**
   * Update an integration
   */
  update(id: UUID, data: UpdateIntegrationData): AsyncResult<Integration>;
  
  /**
   * Update integration status
   */
  updateStatus(id: UUID, status: IntegrationStatus): AsyncResult<Integration>;
  
  /**
   * Delete an integration
   */
  delete(id: UUID): AsyncResult<void>;

  // -------------------------------------------------------------------------
  // Health & Sync
  // -------------------------------------------------------------------------
  
  /**
   * Update health status
   */
  updateHealthStatus(id: UUID, status: HealthStatus): AsyncResult<Integration>;
  
  /**
   * Update last sync timestamp
   */
  updateLastSync(id: UUID): AsyncResult<Integration>;
  
  /**
   * Test connection to integration
   */
  testConnection(id: UUID): AsyncResult<boolean>;
}
