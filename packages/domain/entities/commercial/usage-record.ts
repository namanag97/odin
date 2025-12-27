/**
 * UsageRecord Entity - Commercial Layer
 * 
 * Tracks metered usage for billing.
 */

import type { 
  UUID, 
  TenantId,
  ISODateTime, 
  PositiveInt
} from '@odin/core-contracts';

import type { UsageMetric } from './plan';

// ============================================================================
// Entity
// ============================================================================

/**
 * UsageRecord - Individual usage event
 */
export interface UsageRecord {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly subscriptionId: UUID;
  readonly metric: UsageMetric;
  readonly quantity: PositiveInt;
  readonly timestamp: ISODateTime;
  readonly idempotencyKey?: string;
  readonly metadata?: Record<string, unknown>;
}

// ============================================================================
// Summary Types
// ============================================================================

/**
 * UsageSummary - Aggregated usage for a period
 */
export interface UsageSummary {
  readonly tenantId: TenantId;
  readonly metric: UsageMetric;
  readonly periodStart: ISODateTime;
  readonly periodEnd: ISODateTime;
  readonly totalQuantity: number;
  readonly billableQuantity: number;
  readonly includedQuantity: number;
  readonly estimatedCost: number;
}

/**
 * TimeSeriesPoint - Single point in a usage time series
 */
export interface TimeSeriesPoint {
  readonly timestamp: ISODateTime;
  readonly value: number;
}

/** Granularity for time series queries */
export type TimeSeriesGranularity = 'hour' | 'day' | 'week' | 'month';

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new usage record
 */
export interface CreateUsageRecordData {
  readonly tenantId: TenantId;
  readonly subscriptionId: UUID;
  readonly metric: UsageMetric;
  readonly quantity: PositiveInt;
  readonly timestamp?: ISODateTime;
  readonly idempotencyKey?: string;
  readonly metadata?: Record<string, unknown>;
}
