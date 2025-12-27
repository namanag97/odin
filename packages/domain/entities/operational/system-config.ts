/**
 * SystemConfig Entity - Operational Layer
 * 
 * Global system-wide configuration (platform admin only).
 */

import type { 
  UserId,
  ISODateTime,
  JSONString
} from '@odin/core-contracts';

// ============================================================================
// Types
// ============================================================================

/** Configuration value type */
export type ConfigValueType = 'string' | 'number' | 'boolean' | 'json' | 'secret';

// ============================================================================
// Entity
// ============================================================================

/**
 * SystemConfig - Global configuration entry
 */
export interface SystemConfig {
  readonly key: string;
  readonly value: unknown;
  readonly type: ConfigValueType;
  readonly description?: string;
  readonly isSecret: boolean;
  readonly validationSchema?: JSONString;
  readonly updatedAt: ISODateTime;
  readonly updatedBy: UserId;
}

// ============================================================================
// Metadata & History
// ============================================================================

/**
 * Metadata for a configuration entry
 */
export interface ConfigMetadata {
  readonly description?: string;
  readonly isSecret?: boolean;
  readonly validationSchema?: JSONString;
}

/**
 * Record of a configuration change
 */
export interface ConfigChange {
  readonly key: string;
  readonly previousValue: unknown;
  readonly newValue: unknown;
  readonly changedAt: ISODateTime;
  readonly changedBy: UserId;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data for setting a configuration value
 */
export interface SetConfigData {
  readonly key: string;
  readonly value: unknown;
  readonly type?: ConfigValueType;
  readonly metadata?: ConfigMetadata;
}

/**
 * Data for setting multiple configuration values
 */
export interface SetManyConfigData {
  readonly configs: Record<string, unknown>;
  readonly metadata?: Record<string, ConfigMetadata>;
}
