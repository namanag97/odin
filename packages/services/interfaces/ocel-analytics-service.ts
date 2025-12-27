import type {
  AsyncResult,
  DataModelId,
  ISODateTime,
  Duration,
  Percentage,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination, SortConfig, DateRange } from "./common";

/**
 * Object-centric event log analytics.
 */
export interface IOCELAnalyticsService extends IService {
  // Event Queries
  getEvents(input: GetOCELEventsInput, ctx: OperationContext): AsyncResult<PaginatedResult<OCELEvent>>;
  getEventDetails(input: GetEventDetailsInput, ctx: OperationContext): AsyncResult<OCELEvent>;
  getEventsByObject(input: EventsByObjectInput, ctx: OperationContext): AsyncResult<readonly OCELEvent[]>;

  // Object Queries
  getObjects(input: GetObjectsInput, ctx: OperationContext): AsyncResult<PaginatedResult<OCELObject>>;
  getObjectDetails(input: GetObjectDetailsInput, ctx: OperationContext): AsyncResult<ObjectDetails>;
  getObjectLifecycle(input: ObjectLifecycleInput, ctx: OperationContext): AsyncResult<ObjectLifecycleDetails>;
  getObjectGraph(input: ObjectGraphInput, ctx: OperationContext): AsyncResult<ObjectGraph>;

  // Activity Analysis
  getActivityStatistics(input: ActivityStatsInput, ctx: OperationContext): AsyncResult<readonly ActivityStatistic[]>;
  getActivityTransitions(input: ActivityTransitionsInput, ctx: OperationContext): AsyncResult<readonly TransitionStatistic[]>;

  // Object Type Analysis
  getObjectTypeStatistics(input: ObjectTypeStatsInput, ctx: OperationContext): AsyncResult<readonly ObjectTypeStatistic[]>;
  getObjectInteractions(input: ObjectInteractionsInput, ctx: OperationContext): AsyncResult<ObjectInteractionMatrix>;

  // Time Analysis
  getTemporalDistribution(input: TemporalDistributionInput, ctx: OperationContext): AsyncResult<TemporalDistribution>;
  getPerformanceMetrics(input: OCELPerformanceMetricsInput, ctx: OperationContext): AsyncResult<OCELPerformanceMetrics>;

  // Filtering
  applyFilter(input: ApplyFilterInput, ctx: OperationContext): AsyncResult<FilterResult>;
  getFilteredStatistics(input: FilteredStatsInput, ctx: OperationContext): AsyncResult<FilteredStatistics>;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type OCELTimeGranularity = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

export type PerformanceMetricType =
  | 'throughput_time' | 'waiting_time' | 'service_time'
  | 'cycle_time' | 'lead_time' | 'touch_time';

export interface AnalyticsOCELFilter {
  readonly type: 'activity' | 'object_type' | 'time_range' | 'attribute' | 'variant';
  readonly config: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════
// Core OCEL Types
// ═══════════════════════════════════════════════════════════════

export interface OCELEvent {
  readonly id: string;
  readonly dataModelId: DataModelId;
  readonly activity: string;
  readonly timestamp: ISODateTime;
  readonly objects: readonly EventObject[];
  readonly attributes: Record<string, unknown>;
}

export interface EventObject {
  readonly objectType: string;
  readonly objectId: string;
  readonly qualifier?: string;
}

export interface OCELObject {
  readonly id: string;
  readonly dataModelId: DataModelId;
  readonly objectType: string;
  readonly attributes: Record<string, unknown>;
}

export interface ActivityStatistic {
  readonly activity: string;
  readonly frequency: number;
  readonly percentage: Percentage;
  readonly avgDuration?: Duration;
  readonly objectTypes: readonly string[];
}

export interface ObjectTypeStatistic {
  readonly objectType: string;
  readonly objectCount: number;
  readonly eventCount: number;
  readonly avgEventsPerObject: number;
  readonly avgLifecycleDuration: Duration;
}

export interface HistogramBucket {
  readonly min: number;
  readonly max: number;
  readonly count: number;
  readonly percentage: Percentage;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface GetOCELEventsInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly AnalyticsOCELFilter[];
  readonly dateRange?: DateRange;
  readonly activities?: readonly string[];
  readonly objectTypes?: readonly string[];
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

export interface GetEventDetailsInput {
  readonly dataModelId: DataModelId;
  readonly eventId: string;
  readonly includeObjects?: boolean;
}

export interface EventsByObjectInput {
  readonly dataModelId: DataModelId;
  readonly objectType: string;
  readonly objectId: string;
  readonly dateRange?: DateRange;
}

export interface GetObjectsInput {
  readonly dataModelId: DataModelId;
  readonly objectType: string;
  readonly filters?: readonly AnalyticsOCELFilter[];
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

export interface GetObjectDetailsInput {
  readonly dataModelId: DataModelId;
  readonly objectType: string;
  readonly objectId: string;
}

export interface ObjectDetails extends OCELObject {
  readonly events: readonly OCELEvent[];
  readonly relatedObjects: readonly RelatedObject[];
  readonly metrics: ObjectMetrics;
}

export interface RelatedObject {
  readonly object: OCELObject;
  readonly relation: string;
  readonly sharedEventCount: number;
}

export interface ObjectMetrics {
  readonly eventCount: number;
  readonly uniqueActivities: number;
  readonly lifecycleDuration: Duration;
  readonly firstEventAt: ISODateTime;
  readonly lastEventAt: ISODateTime;
}

export interface ObjectLifecycleInput {
  readonly dataModelId: DataModelId;
  readonly objectType: string;
  readonly objectId: string;
}

export interface ObjectLifecycleDetails {
  readonly object: OCELObject;
  readonly timeline: readonly LifecycleEvent[];
  readonly stateTransitions: readonly StateTransition[];
  readonly metrics: LifecycleMetrics;
}

export interface LifecycleEvent {
  readonly eventId: string;
  readonly activity: string;
  readonly timestamp: ISODateTime;
  readonly coObjects: readonly EventObject[];
  readonly attributes: Record<string, unknown>;
}

export interface StateTransition {
  readonly fromActivity: string;
  readonly toActivity: string;
  readonly duration: Duration;
  readonly timestamp: ISODateTime;
}

export interface LifecycleMetrics {
  readonly totalDuration: Duration;
  readonly avgTimeBetweenEvents: Duration;
  readonly longestWait: { duration: Duration; after: string; before: string };
  readonly activityFrequency: Record<string, number>;
}

export interface ObjectGraphInput {
  readonly dataModelId: DataModelId;
  readonly objectType: string;
  readonly objectId: string;
  readonly depth?: number;
  readonly includeTypes?: readonly string[];
}

export interface ObjectGraph {
  readonly rootObject: OCELObject;
  readonly nodes: readonly ObjectGraphNode[];
  readonly edges: readonly ObjectGraphEdge[];
}

export interface ObjectGraphNode {
  readonly object: OCELObject;
  readonly depth: number;
  readonly sharedEvents: number;
}

export interface ObjectGraphEdge {
  readonly sourceId: string;
  readonly targetId: string;
  readonly relation: string;
  readonly weight: number;
}

export interface ActivityStatsInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly AnalyticsOCELFilter[];
  readonly includePerformance?: boolean;
}

export interface ActivityTransitionsInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly AnalyticsOCELFilter[];
  readonly minFrequency?: number;
}

export interface TransitionStatistic {
  readonly fromActivity: string;
  readonly toActivity: string;
  readonly frequency: number;
  readonly percentage: Percentage;
  readonly performance?: TransitionPerformance;
}

export interface TransitionPerformance {
  readonly avgDuration: Duration;
  readonly minDuration: Duration;
  readonly maxDuration: Duration;
  readonly medianDuration: Duration;
  readonly stdDev: Duration;
}

export interface ObjectTypeStatsInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly AnalyticsOCELFilter[];
}

export interface ObjectInteractionsInput {
  readonly dataModelId: DataModelId;
  readonly objectTypes?: readonly string[];
  readonly minInteractions?: number;
}

export interface ObjectInteractionMatrix {
  readonly objectTypes: readonly string[];
  readonly interactions: readonly ObjectInteraction[];
}

export interface ObjectInteraction {
  readonly typeA: string;
  readonly typeB: string;
  readonly sharedEventCount: number;
  readonly avgEventsPerInteraction: number;
  readonly commonActivities: readonly string[];
}

export interface TemporalDistributionInput {
  readonly dataModelId: DataModelId;
  readonly granularity: OCELTimeGranularity;
  readonly dateRange?: DateRange;
  readonly groupBy?: 'activity' | 'object_type';
  readonly filters?: readonly AnalyticsOCELFilter[];
}

export interface TemporalDistribution {
  readonly granularity: OCELTimeGranularity;
  readonly buckets: readonly TemporalBucket[];
  readonly trend: TrendAnalysis;
}

export interface TemporalBucket {
  readonly timestamp: ISODateTime;
  readonly count: number;
  readonly breakdown?: Record<string, number>;
}

export interface TrendAnalysis {
  readonly direction: 'increasing' | 'decreasing' | 'stable';
  readonly percentageChange: Percentage;
  readonly seasonality?: SeasonalityInfo;
}

export interface SeasonalityInfo {
  readonly detected: boolean;
  readonly period?: OCELTimeGranularity;
  readonly peakPeriods?: readonly string[];
}

export interface OCELPerformanceMetricsInput {
  readonly dataModelId: DataModelId;
  readonly objectType?: string;
  readonly metrics: readonly PerformanceMetricType[];
  readonly filters?: readonly AnalyticsOCELFilter[];
  readonly groupBy?: string;
}

export interface OCELPerformanceMetrics {
  readonly metrics: Record<PerformanceMetricType, MetricValue>;
  readonly distribution?: Record<PerformanceMetricType, DistributionData>;
  readonly byGroup?: Record<string, Record<PerformanceMetricType, MetricValue>>;
}

export interface MetricValue {
  readonly avg: Duration;
  readonly min: Duration;
  readonly max: Duration;
  readonly median: Duration;
  readonly percentile95: Duration;
  readonly stdDev: Duration;
}

export interface DistributionData {
  readonly buckets: readonly HistogramBucket[];
  readonly outliers: number;
}

export interface ApplyFilterInput {
  readonly dataModelId: DataModelId;
  readonly filters: readonly AnalyticsOCELFilter[];
}

export interface FilterResult {
  readonly originalCount: number;
  readonly filteredCount: number;
  readonly reductionPercentage: Percentage;
  readonly filterBreakdown: readonly FilterImpact[];
}

export interface FilterImpact {
  readonly filter: AnalyticsOCELFilter;
  readonly removedCount: number;
  readonly remainingCount: number;
}

export interface FilteredStatsInput {
  readonly dataModelId: DataModelId;
  readonly filters: readonly AnalyticsOCELFilter[];
}

export interface FilteredStatistics {
  readonly eventCount: number;
  readonly objectCounts: Record<string, number>;
  readonly activityCounts: Record<string, number>;
  readonly dateRange: DateRange;
  readonly comparisonToUnfiltered: StatisticsComparison;
}

export interface StatisticsComparison {
  readonly eventReduction: Percentage;
  readonly objectReduction: Record<string, Percentage>;
  readonly activityReduction: Record<string, Percentage>;
}
