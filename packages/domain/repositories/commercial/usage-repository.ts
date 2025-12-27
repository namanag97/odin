/**
 * Usage Repository Interface - Commercial Layer
 * 
 * Data access contract for UsageRecord entities.
 */

import type { 
  TenantId,
  AsyncResult,
  DateRange
} from '@odin/core-contracts';

import type { UsageMetric } from '../../entities/commercial/plan';

import type { 
  UsageRecord,
  UsageSummary,
  TimeSeriesPoint,
  TimeSeriesGranularity,
  CreateUsageRecordData
} from '../../entities/commercial/usage-record';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * IUsageRepository - Usage data access contract
 */
export interface IUsageRepository {
  // -------------------------------------------------------------------------
  // Recording
  // -------------------------------------------------------------------------
  
  /**
   * Record a single usage event
   */
  record(data: CreateUsageRecordData): AsyncResult<UsageRecord>;
  
  /**
   * Record multiple usage events in batch
   */
  recordBatch(records: readonly CreateUsageRecordData[]): AsyncResult<readonly UsageRecord[]>;

  // -------------------------------------------------------------------------
  // Summaries
  // -------------------------------------------------------------------------
  
  /**
   * Get usage summary for a specific metric
   */
  getSummary(
    tenantId: TenantId, 
    metric: UsageMetric, 
    period: DateRange
  ): AsyncResult<UsageSummary>;
  
  /**
   * Get all usage summaries for a tenant
   */
  getAllSummaries(
    tenantId: TenantId, 
    period: DateRange
  ): AsyncResult<readonly UsageSummary[]>;

  // -------------------------------------------------------------------------
  // Time Series
  // -------------------------------------------------------------------------
  
  /**
   * Get usage time series data
   */
  getTimeSeries(
    tenantId: TenantId,
    metric: UsageMetric,
    period: DateRange,
    granularity: TimeSeriesGranularity
  ): AsyncResult<readonly TimeSeriesPoint[]>;
}
