/**
 * Variant Entity - Process Mining Domain
 *
 * Process variant representing a unique activity sequence.
 */

import type {
  VariantId as CoreVariantId,
  DataModelId,
  Duration,
  Percentage,
  TenantId,
  ISODateTime,
} from '@odin/core-contracts';

// ============================================================================
// Re-export Branded IDs from core-contracts
// ============================================================================

export type VariantId = CoreVariantId;

// ============================================================================
// Entity
// ============================================================================

/**
 * Variant - Unique activity sequence in a process
 */
export interface Variant {
  readonly id: VariantId;
  readonly tenantId: TenantId;
  readonly dataModelId: DataModelId;
  readonly activitySequence: readonly string[];
  readonly hash: string;
  readonly caseCount: number;
  readonly frequency: Percentage;
  readonly avgThroughputTime: Duration;
  readonly minThroughputTime: Duration;
  readonly maxThroughputTime: Duration;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new Variant
 */
export interface CreateVariantData {
  readonly tenantId: TenantId;
  readonly dataModelId: DataModelId;
  readonly activitySequence: readonly string[];
  readonly hash?: string;
}

/**
 * Data for updating a Variant
 */
export interface UpdateVariantData {
  readonly caseCount?: number;
  readonly frequency?: Percentage;
  readonly avgThroughputTime?: Duration;
  readonly minThroughputTime?: Duration;
  readonly maxThroughputTime?: Duration;
}

