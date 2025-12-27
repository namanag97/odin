/**
 * SystemConfig Entity - Operational Layer
 * 
 * Global system-wide configuration (platform admin only).
 */

import type {
  UserId,
  ISODateTime,
  JSONString,
  Brand,
} from '@odin/core-contracts';

// ============================================================================
// Branded IDs
// ============================================================================

/** Branded SystemConfig ID (config key) */
export type SystemConfigId = Brand<string, 'SystemConfigId'>;

/** Cast function for SystemConfigId */
export const asSystemConfigId = (key: string): SystemConfigId => key as unknown as SystemConfigId;

// ============================================================================
// Types
// ============================================================================

/** Configuration value type */
export type ConfigValueType = 'string' | 'number' | 'boolean' | 'json' | 'secret';

/** Alias for SystemConfigType */
export type SystemConfigType = ConfigValueType;

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
 * Data for creating a new configuration entry
 */
export interface CreateSystemConfigData {
  readonly key: string;
  readonly value: unknown;
  readonly type: ConfigValueType;
  readonly description?: string;
  readonly isSecret?: boolean;
  readonly validationSchema?: JSONString;
}

/**
 * Data for updating a configuration entry
 */
export interface UpdateSystemConfigData {
  readonly value?: unknown;
  readonly description?: string;
  readonly validationSchema?: JSONString;
}

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
