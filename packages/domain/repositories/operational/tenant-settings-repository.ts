/**
 * TenantSettings Repository Interface - Operational Layer
 * 
 * Data access contract for TenantSettings entities.
 */

import type { 
  TenantId,
  UserId,
  AsyncResult
} from '@odin/core-contracts';

import type { 
  ExtendedTenantSettings,
  BrandingSettings,
  SecuritySettings,
  NotificationSettings,
  ProcessMiningSettings,
  UpdateTenantSettingsData
} from '../../entities/operational/tenant-settings';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * ITenantSettingsRepository - ExtendedTenantSettings data access contract
 */
export interface ITenantSettingsRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Get settings for a tenant
   */
  findByTenantId(tenantId: TenantId): AsyncResult<ExtendedTenantSettings | null>;
  
  /**
   * Get or create default settings for a tenant
   */
  getOrCreate(tenantId: TenantId): AsyncResult<ExtendedTenantSettings>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Update tenant settings
   */
  update(
    tenantId: TenantId, 
    data: UpdateTenantSettingsData, 
    updatedBy: UserId
  ): AsyncResult<ExtendedTenantSettings>;
  
  /**
   * Update branding settings only
   */
  updateBranding(
    tenantId: TenantId, 
    branding: Partial<BrandingSettings>, 
    updatedBy: UserId
  ): AsyncResult<ExtendedTenantSettings>;
  
  /**
   * Update security settings only
   */
  updateSecurity(
    tenantId: TenantId, 
    security: Partial<SecuritySettings>, 
    updatedBy: UserId
  ): AsyncResult<ExtendedTenantSettings>;
  
  /**
   * Update notification settings only
   */
  updateNotifications(
    tenantId: TenantId, 
    notifications: Partial<NotificationSettings>, 
    updatedBy: UserId
  ): AsyncResult<ExtendedTenantSettings>;
  
  /**
   * Update process mining settings only
   */
  updateProcessMining(
    tenantId: TenantId, 
    processMining: Partial<ProcessMiningSettings>, 
    updatedBy: UserId
  ): AsyncResult<ExtendedTenantSettings>;
  
  /**
   * Reset settings to defaults
   */
  reset(tenantId: TenantId, updatedBy: UserId): AsyncResult<ExtendedTenantSettings>;
}

