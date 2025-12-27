import type {
  AsyncResult,
  UUID,
  DataModelId,
  VariantId,
  ISODateTime,
  Duration,
  Percentage,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination, SortConfig, DateRange, FilterClause } from "./common";

/**
 * Case management and analysis service.
 */
export interface ICaseService extends IService {
  // Queries
  getCase(id: CaseId, ctx: OperationContext): AsyncResult<Case>;
  listCases(input: ListCasesInput, ctx: OperationContext): AsyncResult<PaginatedResult<Case>>;
  getCaseDetails(id: CaseId, ctx: OperationContext): AsyncResult<CaseDetails>;
  getCaseTimeline(id: CaseId, ctx: OperationContext): AsyncResult<CaseTimeline>;

  // Analysis
  analyzeCases(input: AnalyzeCasesInput, ctx: OperationContext): AsyncResult<CaseAnalysis>;
  compareCases(caseIds: readonly CaseId[], ctx: OperationContext): AsyncResult<CaseComparison>;

  // Filtering
  filterCases(input: FilterCasesInput, ctx: OperationContext): AsyncResult<FilteredCasesResult>;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type CaseId = string;
export type CaseStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export type MetricType =
  | 'duration' | 'cost' | 'throughput' | 'rework_rate'
  | 'bottleneck_time' | 'resource_utilization';

// ═══════════════════════════════════════════════════════════════
// Core Case Types
// ═══════════════════════════════════════════════════════════════

export interface Case {
  readonly id: CaseId;
  readonly dataModelId: DataModelId;
  readonly variantId: VariantId;
  readonly status: CaseStatus;
  readonly startTime: ISODateTime;
  readonly endTime?: ISODateTime;
  readonly duration?: Duration;
  readonly eventCount: number;
  readonly attributes: Record<string, unknown>;
}

export interface CaseEvent {
  readonly id: UUID;
  readonly activity: string;
  readonly timestamp: ISODateTime;
  readonly resource?: string;
  readonly cost?: number;
  readonly attributes: Record<string, unknown>;
}

export interface CaseObject {
  readonly objectId: UUID;
  readonly objectType: string;
  readonly role: string;
  readonly firstSeen: ISODateTime;
  readonly lastSeen: ISODateTime;
}

export interface Variant {
  readonly id: VariantId;
  readonly dataModelId: DataModelId;
  readonly activities: readonly string[];
  readonly caseCount: number;
  readonly percentage: Percentage;
  readonly avgThroughputTime: Duration;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface ListCasesInput {
  readonly dataModelId: DataModelId;
  readonly variantId?: VariantId;
  readonly status?: CaseStatus;
  readonly dateRange?: DateRange;
  readonly durationRange?: CaseDurationRange;
  readonly search?: string;
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

export interface CaseDurationRange {
  readonly min?: Duration;
  readonly max?: Duration;
}

export interface CaseDetails extends Case {
  readonly events: readonly CaseEvent[];
  readonly objects: readonly CaseObject[];
  readonly metrics: CaseMetrics;
  readonly variant: Variant;
}

export interface CaseMetrics {
  readonly duration: Duration;
  readonly throughputTime: Duration;
  readonly waitingTime: Duration;
  readonly processingTime: Duration;
  readonly totalCost?: number;
  readonly eventCount: number;
  readonly reworkCount: number;
}

export interface CaseTimeline {
  readonly caseId: CaseId;
  readonly events: readonly TimelineEvent[];
  readonly phases: readonly CasePhase[];
  readonly milestones: readonly Milestone[];
}

export interface TimelineEvent extends CaseEvent {
  readonly duration?: Duration;
  readonly waitTime?: Duration;
  readonly deviations?: readonly string[];
}

export interface CasePhase {
  readonly name: string;
  readonly startTime: ISODateTime;
  readonly endTime: ISODateTime;
  readonly duration: Duration;
  readonly activities: readonly string[];
}

export interface Milestone {
  readonly name: string;
  readonly timestamp: ISODateTime;
  readonly achieved: boolean;
  readonly expectedTime?: ISODateTime;
  readonly deviation?: Duration;
}

export interface AnalyzeCasesInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly FilterClause[];
  readonly metrics: readonly MetricType[];
  readonly groupBy?: readonly string[];
}

export interface CaseAnalysis {
  readonly totalCases: number;
  readonly metrics: Record<MetricType, AggregatedMetric>;
  readonly distributions: Record<string, Distribution>;
  readonly outliers: readonly OutlierCase[];
}

export interface AggregatedMetric {
  readonly avg: number;
  readonly min: number;
  readonly max: number;
  readonly median: number;
  readonly stdDev: number;
  readonly percentiles: Record<number, number>;
}

export interface Distribution {
  readonly buckets: readonly DistributionBucket[];
  readonly mean: number;
  readonly variance: number;
}

export interface DistributionBucket {
  readonly range: [number, number];
  readonly count: number;
  readonly percentage: Percentage;
}

export interface OutlierCase {
  readonly caseId: CaseId;
  readonly metric: MetricType;
  readonly value: number;
  readonly deviation: number;
  readonly zScore: number;
}

export interface CaseComparison {
  readonly cases: readonly CaseId[];
  readonly commonalities: CaseCommonalities;
  readonly differences: CaseDifferences;
  readonly metrics: CaseComparisonMetrics;
}

export interface CaseCommonalities {
  readonly sharedActivities: readonly string[];
  readonly sharedResources: readonly string[];
  readonly sharedObjects: readonly string[];
  readonly commonPattern?: string;
}

export interface CaseDifferences {
  readonly uniqueActivities: Record<string, readonly string[]>;
  readonly pathDivergence: readonly PathDivergence[];
  readonly metricDeltas: Record<MetricType, number>;
}

export interface PathDivergence {
  readonly position: number;
  readonly activity: string;
  readonly casesWithActivity: readonly CaseId[];
  readonly casesWithoutActivity: readonly CaseId[];
}

export interface CaseComparisonMetrics {
  readonly pathSimilarity: Percentage;
  readonly durationDelta: Duration;
  readonly costDelta?: number;
  readonly complexityDelta: number;
}

export interface FilterCasesInput {
  readonly dataModelId: DataModelId;
  readonly filters: readonly FilterClause[];
  readonly returnCases?: boolean;
  readonly pagination?: Pagination;
}

export interface FilteredCasesResult {
  readonly matchingCases: number;
  readonly totalCases: number;
  readonly percentage: Percentage;
  readonly cases?: readonly Case[];
  readonly summary: FilterSummary;
}

export interface FilterSummary {
  readonly byVariant: Record<VariantId, number>;
  readonly byStatus: Record<CaseStatus, number>;
  readonly avgDuration: Duration;
  readonly dateRange: DateRange;
}
