/**
 * DataPool Entity - Process Mining Domain
 * 
 * Container for all data tables within a tenant.
 * Provides isolation and versioning for data sources.
 */

import type {
  DataPoolId as CoreDataPoolId,
  TenantId,
  UserId,
  ISODateTime,
  PositiveInt,
  NonNegativeInt,
} from '@odin/core-contracts';

// ============================================================================
// Re-export Branded IDs from core-contracts
// ============================================================================

export type DataPoolId = CoreDataPoolId;

// ============================================================================
// Status Types
// ============================================================================

/** DataPool lifecycle status */
export type DataPoolStatus = 'active' | 'archived' | 'error';

/** DataPool type (alias for repositories) */
export type DataPoolType = DataPoolStatus;

/** How to handle null values during import */
export type NullHandling = 'keep' | 'empty_string' | 'default';

// ============================================================================
// Settings & Statistics
// ============================================================================

/**
 * DataPool-level configuration
 */
export interface DataPoolSettings {
  readonly timezone: string;
  readonly dateFormat: string;
  readonly nullHandling: NullHandling;
  readonly deduplicationEnabled: boolean;
}

/**
 * DataPool statistics
 */
export interface DataPoolStatistics {
  readonly tableCount: NonNegativeInt;
  readonly totalRows: NonNegativeInt;
  readonly totalSizeBytes: NonNegativeInt;
  readonly lastRefreshedAt?: ISODateTime;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * DataPool - Container for all data tables within a tenant
 */
export interface DataPool {
  readonly id: DataPoolId;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description?: string;
  readonly status: DataPoolStatus;
  readonly version: PositiveInt;
  readonly settings: DataPoolSettings;
  readonly statistics: DataPoolStatistics;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new DataPool
 */
export interface CreateDataPoolData {
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description?: string;
  readonly settings?: Partial<DataPoolSettings>;
  readonly createdBy: UserId;
}

/**
 * Data for updating a DataPool
 */
export interface UpdateDataPoolData {
  readonly name?: string;
  readonly description?: string;
  readonly settings?: Partial<DataPoolSettings>;
}
