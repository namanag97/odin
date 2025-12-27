/**
 * MFA Device Repository Interface - Identity Layer
 * 
 * Data access contract for MfaDevice entities.
 */

import type { 
  UserId,
  UUID,
  AsyncResult
} from '@odin/core-contracts';

import type { 
  MfaDevice,
  CreateMfaDeviceData
} from '../../entities/identity/mfa-device';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * IMfaDeviceRepository - MFA Device data access contract
 */
export interface IMfaDeviceRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find an MFA device by ID
   */
  findById(id: UUID): AsyncResult<MfaDevice | null>;
  
  /**
   * Find all MFA devices for a user
   */
  findByUserId(userId: UserId): AsyncResult<readonly MfaDevice[]>;
  
  /**
   * Get the default MFA device for a user
   */
  findDefault(userId: UserId): AsyncResult<MfaDevice | null>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new MFA device
   */
  create(data: CreateMfaDeviceData): AsyncResult<MfaDevice>;
  
  /**
   * Set a device as the default for a user
   */
  setDefault(userId: UserId, deviceId: UUID): AsyncResult<void>;
  
  /**
   * Update last used timestamp
   */
  updateLastUsed(id: UUID): AsyncResult<void>;
  
  /**
   * Delete an MFA device
   */
  delete(id: UUID): AsyncResult<void>;
  
  /**
   * Delete all MFA devices for a user
   */
  deleteAllForUser(userId: UserId): AsyncResult<void>;
}
