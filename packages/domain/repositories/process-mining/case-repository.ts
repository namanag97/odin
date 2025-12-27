/**
 * Case Repository Interface - Process Mining Layer
 *
 * Data access contract for Case and Variant queries.
 */

import type {
  DataModelId,
  CaseId,
  VariantId,
  AsyncResult,
  PageRequest,
  PageResponse,
  QueryOptions,
  DateRange,
  Duration,
  Percentage,
} from '@odin/core-contracts';

import type {
  Case,
  CaseEvent,
  CaseMetrics,
} from '../../entities/process-mining/case';

import type {
  Variant,
} from '../../entities/process-mining/variant';

/**
 * ICaseRepository - Case data access contract
 */
export interface ICaseRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  /**
   * Find a case by ID
   */
  findById(
    modelId: DataModelId,
    caseId: CaseId
  ): AsyncResult<Case | null>;

  /**
   * Find cases by model ID
   */
  findByModelId(
    modelId: DataModelId,
    options?: CaseQueryOptions
  ): AsyncResult<PageResponse<Case>>;

  /**
   * Find cases by variant
   */
  findByVariant(
    modelId: DataModelId,
    variantId: VariantId,
    options?: QueryOptions
  ): AsyncResult<PageResponse<Case>>;

  /**
   * Get events for a case
   */
  getCaseEvents(
    modelId: DataModelId,
    caseId: CaseId
  ): AsyncResult<readonly CaseEvent[]>;

  // -------------------------------------------------------------------------
  // Variants
  // -------------------------------------------------------------------------

  /**
   * Get all variants for a model
   */
  getVariants(
    modelId: DataModelId,
    options?: VariantQueryOptions
  ): AsyncResult<PageResponse<Variant>>;

  /**
   * Get a variant by ID
   */
  getVariantById(
    modelId: DataModelId,
    variantId: VariantId
  ): AsyncResult<Variant | null>;

  // -------------------------------------------------------------------------
  // Metrics
  // -------------------------------------------------------------------------

  /**
   * Get case metrics
   */
  getCaseMetrics(
    modelId: DataModelId,
    caseId: CaseId
  ): AsyncResult<CaseMetrics>;

  /**
   * Get aggregated metrics
   */
  getAggregatedMetrics(
    modelId: DataModelId,
    filters?: readonly CaseFilter[]
  ): AsyncResult<AggregatedCaseMetrics>;
}

// ============================================================================
// Supporting Types
// ============================================================================

/**
 * Case query options
 */
export interface CaseQueryOptions extends QueryOptions {
  readonly variantIds?: readonly VariantId[];
  readonly dateRange?: DateRange;
  readonly minEvents?: number;
  readonly maxEvents?: number;
  readonly throughputTimeRange?: { min?: Duration; max?: Duration };
}

/**
 * Variant query options
 */
export interface VariantQueryOptions extends QueryOptions {
  readonly minCaseCount?: number;
  readonly minFrequency?: Percentage;
  readonly containsActivity?: string;
  readonly startsWithActivity?: string;
  readonly endsWithActivity?: string;
}

/**
 * Case filter
 */
export interface CaseFilter {
  readonly field: string;
  readonly operator: string;
  readonly value: unknown;
}

/**
 * Aggregated case metrics
 */
export interface AggregatedCaseMetrics {
  readonly totalCases: number;
  readonly totalEvents: number;
  readonly uniqueVariants: number;
  readonly avgThroughputTime: Duration;
  readonly medianThroughputTime: Duration;
  readonly percentile95ThroughputTime: Duration;
  readonly throughputTimeDistribution: readonly HistogramBucket[];
}

/**
 * Histogram bucket
 */
export interface HistogramBucket {
  readonly min: number;
  readonly max: number;
  readonly count: number;
}
