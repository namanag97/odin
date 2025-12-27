import type {
  AsyncResult,
  DataModelId,
  VariantId,
  ISODateTime,
  Duration,
  Percentage,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination, SortConfig, DateRange } from "./common";
import type { CaseConformanceResult } from "./conformance-service";

/**
 * Case-centric analytics (derived from or native to case-centric models).
 */
export interface ICaseAnalyticsService extends IService {
  // Case Queries
  getCases(input: GetCasesInput, ctx: OperationContext): AsyncResult<PaginatedResult<Case>>;
  getCaseDetails(input: GetCaseDetailsInput, ctx: OperationContext): AsyncResult<CaseDetails>;
  getCaseEvents(input: GetCaseEventsInput, ctx: OperationContext): AsyncResult<readonly CaseEvent[]>;

  // Variant Analysis
  getVariants(input: GetCaseVariantsInput, ctx: OperationContext): AsyncResult<PaginatedResult<Variant>>;
  getVariantDetails(input: GetVariantDetailsInput, ctx: OperationContext): AsyncResult<VariantDetails>;
  compareVariants(input: CompareVariantsInput, ctx: OperationContext): AsyncResult<VariantComparison>;

  // Performance Analysis
  getThroughputAnalysis(input: ThroughputAnalysisInput, ctx: OperationContext): AsyncResult<ThroughputAnalysis>;
  getBottleneckAnalysis(input: BottleneckAnalysisInput, ctx: OperationContext): AsyncResult<BottleneckAnalysis>;

  // Clustering
  clusterCases(input: ClusterCasesInput, ctx: OperationContext): AsyncResult<ClusteringResult>;

  // Root Cause Analysis
  analyzeRootCause(input: RootCauseInput, ctx: OperationContext): AsyncResult<RootCauseAnalysis>;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type ClusteringMethod = 'kmeans' | 'hierarchical' | 'dbscan';

export type ClusteringFeature =
  | 'throughput_time' | 'event_count' | 'variant'
  | 'start_activity' | 'end_activity' | 'activities'
  | { attribute: string };

// ═══════════════════════════════════════════════════════════════
// Core Case Types
// ═══════════════════════════════════════════════════════════════

export interface Case {
  readonly id: string;
  readonly dataModelId: DataModelId;
  readonly variantId: VariantId;
  readonly eventCount: number;
  readonly startTime: ISODateTime;
  readonly endTime: ISODateTime;
  readonly throughputTime: Duration;
  readonly attributes: Record<string, unknown>;
}

export interface Variant {
  readonly id: VariantId;
  readonly dataModelId: DataModelId;
  readonly activities: readonly string[];
  readonly caseCount: number;
  readonly percentage: Percentage;
  readonly avgThroughputTime: Duration;
}

export interface CaseEvent {
  readonly id: string;
  readonly caseId: string;
  readonly activity: string;
  readonly timestamp: ISODateTime;
  readonly attributes: Record<string, unknown>;
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

export interface CaseFilter {
  readonly type: 'attribute' | 'variant' | 'throughput' | 'activity' | 'custom';
  readonly config: Record<string, unknown>;
}

export interface DurationRange {
  readonly min?: Duration;
  readonly max?: Duration;
}

export interface GetCasesInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly CaseFilter[];
  readonly dateRange?: DateRange;
  readonly variantIds?: readonly VariantId[];
  readonly throughputRange?: DurationRange;
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

export interface GetCaseDetailsInput {
  readonly dataModelId: DataModelId;
  readonly caseId: string;
}

export interface CaseDetails extends Case {
  readonly timeline: readonly TimelineEvent[];
  readonly performanceBreakdown: PerformanceBreakdown;
  readonly conformance?: CaseConformanceResult;
}

export interface TimelineEvent {
  readonly event: CaseEvent;
  readonly durationFromStart: Duration;
  readonly durationFromPrevious: Duration;
  readonly isBottleneck: boolean;
}

export interface PerformanceBreakdown {
  readonly waitingTime: Duration;
  readonly processingTime: Duration;
  readonly byActivity: Record<string, ActivityPerformance>;
}

export interface ActivityPerformance {
  readonly count: number;
  readonly totalDuration: Duration;
  readonly avgDuration: Duration;
  readonly waitBefore: Duration;
}

export interface GetCaseEventsInput {
  readonly dataModelId: DataModelId;
  readonly caseId: string;
}

export interface GetCaseVariantsInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly CaseFilter[];
  readonly minCaseCount?: number;
  readonly maxVariants?: number;
  readonly includePerformance?: boolean;
  readonly pagination?: Pagination;
}

export interface GetVariantDetailsInput {
  readonly dataModelId: DataModelId;
  readonly variantId: VariantId;
}

export interface VariantDetails extends Variant {
  readonly cases: readonly CaseSummary[];
  readonly performanceDistribution: DistributionData;
  readonly commonAttributes: Record<string, AttributeDistribution>;
}

export interface CaseSummary {
  readonly caseId: string;
  readonly throughputTime: Duration;
  readonly startTime: ISODateTime;
  readonly endTime: ISODateTime;
}

export interface AttributeDistribution {
  readonly values: readonly { value: unknown; count: number; percentage: Percentage }[];
  readonly entropy: number;
}

export interface DistributionData {
  readonly buckets: readonly HistogramBucket[];
  readonly outliers: number;
}

export interface CompareVariantsInput {
  readonly dataModelId: DataModelId;
  readonly variantAId: VariantId;
  readonly variantBId: VariantId;
}

export interface VariantComparison {
  readonly variantA: Variant;
  readonly variantB: Variant;
  readonly sequenceDiff: SequenceDiff;
  readonly performanceDiff: PerformanceDiff;
  readonly attributeDiff: Record<string, AttributeDiff>;
}

export interface SequenceDiff {
  readonly commonActivities: readonly string[];
  readonly onlyInA: readonly string[];
  readonly onlyInB: readonly string[];
  readonly orderDifferences: readonly OrderDiff[];
}

export interface OrderDiff {
  readonly activity: string;
  readonly positionInA: number;
  readonly positionInB: number;
}

export interface PerformanceDiff {
  readonly throughputTimeDiff: Duration;
  readonly throughputTimeRatio: number;
  readonly byActivity: Record<string, { diff: Duration; ratio: number }>;
}

export interface AttributeDiff {
  readonly significantlyDifferent: boolean;
  readonly pValue?: number;
  readonly distributionA: AttributeDistribution;
  readonly distributionB: AttributeDistribution;
}

export interface ThroughputAnalysisInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly CaseFilter[];
  readonly groupBy?: 'variant' | 'time' | 'attribute';
  readonly attribute?: string;
}

export interface ThroughputAnalysis {
  readonly overall: CaseMetricValue;
  readonly distribution: DistributionData;
  readonly byGroup?: readonly ThroughputGroup[];
  readonly trend?: CaseTrendAnalysis;
}

export interface CaseMetricValue {
  readonly avg: Duration;
  readonly min: Duration;
  readonly max: Duration;
  readonly median: Duration;
  readonly percentile95: Duration;
  readonly stdDev: Duration;
}

export interface ThroughputGroup {
  readonly groupKey: string;
  readonly caseCount: number;
  readonly metrics: CaseMetricValue;
}

export interface CaseTrendAnalysis {
  readonly direction: 'increasing' | 'decreasing' | 'stable';
  readonly percentageChange: Percentage;
}

export interface BottleneckAnalysisInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly CaseFilter[];
  readonly threshold?: Percentage;           // Top N% slowest transitions
}

export interface BottleneckAnalysis {
  readonly bottlenecks: readonly CaseBottleneck[];
  readonly totalWaitingTime: Duration;
  readonly bottleneckContribution: Percentage;
}

export interface CaseBottleneck {
  readonly fromActivity: string;
  readonly toActivity: string;
  readonly avgWaitTime: Duration;
  readonly medianWaitTime: Duration;
  readonly affectedCases: number;
  readonly percentageOfTotalWait: Percentage;
  readonly variability: number;              // Coefficient of variation
}

export interface ClusterCasesInput {
  readonly dataModelId: DataModelId;
  readonly method: ClusteringMethod;
  readonly features: readonly ClusteringFeature[];
  readonly numClusters?: number;
  readonly filters?: readonly CaseFilter[];
}

export interface ClusteringResult {
  readonly clusters: readonly Cluster[];
  readonly silhouetteScore: number;
  readonly totalCases: number;
}

export interface Cluster {
  readonly id: number;
  readonly caseCount: number;
  readonly percentage: Percentage;
  readonly centroid: Record<string, unknown>;
  readonly characteristics: ClusterCharacteristics;
  readonly representativeCases: readonly string[];
}

export interface ClusterCharacteristics {
  readonly avgThroughputTime: Duration;
  readonly dominantVariants: readonly { variantId: VariantId; percentage: Percentage }[];
  readonly commonActivities: readonly string[];
  readonly distinctiveAttributes: Record<string, unknown>;
}

export interface RootCauseInput {
  readonly dataModelId: DataModelId;
  readonly targetMetric: 'throughput_time' | 'conformance' | 'outcome';
  readonly targetCondition: TargetCondition;
  readonly candidateAttributes: readonly string[];
  readonly filters?: readonly CaseFilter[];
}

export interface TargetCondition {
  readonly type: 'above_threshold' | 'below_threshold' | 'equals';
  readonly value: unknown;
}

export interface RootCauseAnalysis {
  readonly targetMetric: string;
  readonly targetCondition: TargetCondition;
  readonly affectedCases: number;
  readonly factors: readonly RootCauseFactor[];
  readonly decisionTree?: DecisionTreeNode;
}

export interface RootCauseFactor {
  readonly attribute: string;
  readonly correlation: number;
  readonly significance: number;           // p-value
  readonly effect: 'increases' | 'decreases';
  readonly topValues: readonly { value: unknown; impact: number }[];
}

export interface DecisionTreeNode {
  readonly attribute?: string;
  readonly threshold?: unknown;
  readonly condition?: string;
  readonly probability: number;
  readonly sampleCount: number;
  readonly left?: DecisionTreeNode;
  readonly right?: DecisionTreeNode;
}
