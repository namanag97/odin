/**
 * Environment Entity - Existence Layer
 * 
 * Deployment stage (dev/staging/prod) for isolation.
 */

import type { 
  TenantId,
  DataPoolId,
  UUID,
  ISODateTime, 
  PositiveInt,
  EntityStatus 
} from '@odin/core-contracts';

// ============================================================================
// Types
// ============================================================================

/** Environment type */
export type EnvironmentType = 'development' | 'staging' | 'production';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Resource limits for an environment
 */
export interface ResourceLimits {
  readonly maxConcurrentJobs: PositiveInt;
  /** Maximum event log size in millions */
  readonly maxEventLogSize: PositiveInt;
  readonly maxStorageGB: PositiveInt;
}

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
  readonly dataPoolIds: readonly DataPoolId[];
  readonly featureOverrides: Record<string, boolean>;
  readonly resourceLimits: ResourceLimits;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * Environment - Deployment stage for isolation
 */
export interface Environment {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly type: EnvironmentType;
  readonly status: EntityStatus;
  readonly configuration: EnvironmentConfig;
  /** Source environment if promoted */
  readonly promotedFrom?: UUID;
  readonly createdAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new environment
 */
export interface CreateEnvironmentData {
  readonly tenantId: TenantId;
  readonly name: string;
  readonly type: EnvironmentType;
  readonly configuration?: Partial<EnvironmentConfig>;
  readonly promotedFrom?: UUID;
}

/**
 * Data for updating an environment
 */
export interface UpdateEnvironmentData {
  readonly name?: string;
  readonly configuration?: Partial<EnvironmentConfig>;
}
