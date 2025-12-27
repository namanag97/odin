/**
 * SystemConfig Repository Interface - Operational Layer
 * 
 * Data access contract for SystemConfig entities.
 */

import type { 
  AsyncResult
} from '@odin/core-contracts';

import type { 
  SystemConfig,
  ConfigMetadata,
  ConfigChange
} from '../../entities/operational/system-config';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * ISystemConfigRepository - SystemConfig data access contract
 */
export interface ISystemConfigRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Get a configuration value by key
   */
  get<T>(key: string): AsyncResult<T | null>;
  
  /**
   * Get multiple configuration values by keys
   */
  getMany(keys: readonly string[]): AsyncResult<Record<string, unknown>>;
  
  /**
   * Get all configuration values with a prefix
   */
  getByPrefix(prefix: string): AsyncResult<Record<string, unknown>>;
  
  /**
   * Get the full configuration entry (with metadata)
   */
  getEntry(key: string): AsyncResult<SystemConfig | null>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Set a configuration value
   */
  set(key: string, value: unknown, meta?: ConfigMetadata): AsyncResult<void>;
  
  /**
   * Set multiple configuration values
   */
  setMany(configs: Record<string, unknown>): AsyncResult<void>;
  
  /**
   * Delete a configuration value
   */
  delete(key: string): AsyncResult<void>;

  // -------------------------------------------------------------------------
  // History
  // -------------------------------------------------------------------------
  
  /**
   * Get change history for a configuration key
   */
  getHistory(key: string, limit?: number): AsyncResult<readonly ConfigChange[]>;
}
