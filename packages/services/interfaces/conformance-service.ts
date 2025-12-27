import type {
  AsyncResult,
  DataModelId,
  ProcessModelId,
  VariantId,
  ISODateTime,
  Duration,
  Percentage,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination } from "./common";

/**
 * Conformance checking using PM4Py methods.
 */
export interface IConformanceService extends IService {
  // Conformance Checking
  checkConformance(input: CheckConformanceInput, ctx: OperationContext): AsyncResult<ConformanceResult>;
  checkTokenReplay(input: TokenReplayInput, ctx: OperationContext): AsyncResult<TokenReplayResult>;
  computeAlignments(input: AlignmentsInput, ctx: OperationContext): AsyncResult<AlignmentsResult>;

  // Quality Metrics
  calculateFitness(input: FitnessInput, ctx: OperationContext): AsyncResult<FitnessResult>;
  calculatePrecision(input: PrecisionInput, ctx: OperationContext): AsyncResult<PrecisionResult>;
  calculateGeneralization(input: GeneralizationInput, ctx: OperationContext): AsyncResult<GeneralizationResult>;
  calculateSimplicity(input: SimplicityInput, ctx: OperationContext): AsyncResult<SimplicityResult>;
  calculateAllMetrics(input: AllMetricsInput, ctx: OperationContext): AsyncResult<AllMetricsResult>;

  // Deviations
  getDeviations(input: GetDeviationsInput, ctx: OperationContext): AsyncResult<DeviationsResult>;
  getDeviationStatistics(input: DeviationStatsInput, ctx: OperationContext): AsyncResult<DeviationStatistics>;

  // Case-level Analysis
  getCaseConformance(input: CaseConformanceInput, ctx: OperationContext): AsyncResult<CaseConformanceResult>;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type ConformanceMethod = 'token_replay' | 'alignments' | 'footprints';

export type MoveType = 'sync' | 'log' | 'model' | 'silent';

export type DeviationType =
  | 'missing_activity'       // Activity in model not in log
  | 'unexpected_activity'    // Activity in log not in model
  | 'wrong_order'            // Activities in wrong sequence
  | 'repeated_activity'      // Unexpected repetition
  | 'skipped_activity';      // Expected activity skipped

export interface ConformanceOCELFilter {
  readonly type: 'activity' | 'object_type' | 'time_range' | 'attribute' | 'variant';
  readonly config: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface CheckConformanceInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly method: ConformanceMethod;
  readonly filters?: readonly ConformanceOCELFilter[];
  readonly options?: ConformanceOptions;
}

export interface ConformanceOptions {
  readonly sampleSize?: number;               // For large logs
  readonly timeout?: Duration;
  readonly parallelism?: number;
}

export interface ConformanceResult {
  readonly method: ConformanceMethod;
  readonly fitness: number;
  readonly precision?: number;
  readonly conformantCases: number;
  readonly nonConformantCases: number;
  readonly totalCases: number;
  readonly conformanceRate: Percentage;
  readonly details: ConformanceDetails;
  readonly duration: Duration;
}

export interface ConformanceDetails {
  readonly byActivity?: Record<string, ActivityConformance>;
  readonly byVariant?: readonly VariantConformance[];
}

export interface ActivityConformance {
  readonly activity: string;
  readonly conformant: number;
  readonly nonConformant: number;
  readonly rate: Percentage;
}

export interface VariantConformance {
  readonly variantId: VariantId;
  readonly caseCount: number;
  readonly isConformant: boolean;
  readonly fitness: number;
  readonly deviationCount: number;
}

export interface TokenReplayInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly filters?: readonly ConformanceOCELFilter[];
}

export interface TokenReplayResult {
  readonly traceFitness: number;
  readonly moveModelFitness: number;
  readonly moveLogFitness: number;
  readonly percentageTraceFitness: Percentage;
  readonly replayDetails: readonly TraceReplayDetail[];
  readonly duration: Duration;
}

export interface TraceReplayDetail {
  readonly caseId: string;
  readonly fitness: number;
  readonly producedTokens: number;
  readonly consumedTokens: number;
  readonly missingTokens: number;
  readonly remainingTokens: number;
}

export interface AlignmentsInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly filters?: readonly ConformanceOCELFilter[];
  readonly costFunction?: CostFunction;
  readonly maxCases?: number;
}

export interface CostFunction {
  readonly moveOnLog: number;
  readonly moveOnModel: number;
  readonly synchronousMove: number;
  readonly activityCosts?: Record<string, ActivityCost>;
}

export interface ActivityCost {
  readonly moveOnLog: number;
  readonly moveOnModel: number;
}

export interface AlignmentsResult {
  readonly fitness: number;
  readonly alignments: readonly Alignment[];
  readonly statistics: AlignmentStatistics;
  readonly duration: Duration;
}

export interface Alignment {
  readonly caseId: string;
  readonly cost: number;
  readonly fitness: number;
  readonly moves: readonly AlignmentMove[];
}

export interface AlignmentMove {
  readonly type: MoveType;
  readonly logActivity?: string;
  readonly modelActivity?: string;
  readonly cost: number;
}

export interface AlignmentStatistics {
  readonly avgCost: number;
  readonly avgFitness: number;
  readonly syncMoves: number;
  readonly logMoves: number;
  readonly modelMoves: number;
  readonly silentMoves: number;
}

export interface FitnessInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly method?: 'token_replay' | 'alignments';
  readonly filters?: readonly ConformanceOCELFilter[];
}

export interface FitnessResult {
  readonly fitness: number;
  readonly method: string;
  readonly details: FitnessDetails;
  readonly duration: Duration;
}

export interface FitnessDetails {
  readonly percentageFitTraces: Percentage;
  readonly logFitness: number;
  readonly modelFitness: number;
  readonly traceFitness: number;
}

export interface PrecisionInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly method?: 'etconformance' | 'align_etconformance';
  readonly filters?: readonly ConformanceOCELFilter[];
}

export interface PrecisionResult {
  readonly precision: number;
  readonly method: string;
  readonly duration: Duration;
}

export interface GeneralizationInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly filters?: readonly ConformanceOCELFilter[];
}

export interface GeneralizationResult {
  readonly generalization: number;
  readonly duration: Duration;
}

export interface SimplicityInput {
  readonly processModelId: ProcessModelId;
}

export interface SimplicityResult {
  readonly simplicity: number;
  readonly metrics: SimplicityMetrics;
}

export interface SimplicityMetrics {
  readonly places?: number;
  readonly transitions?: number;
  readonly arcs?: number;
  readonly silentTransitions?: number;
  readonly duplicateTransitions?: number;
}

export interface AllMetricsInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly filters?: readonly ConformanceOCELFilter[];
}

export interface AllMetricsResult {
  readonly fitness: number;
  readonly precision: number;
  readonly generalization: number;
  readonly simplicity: number;
  readonly fMeasure: number;                  // Harmonic mean
  readonly duration: Duration;
}

export interface GetDeviationsInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly filters?: readonly ConformanceOCELFilter[];
  readonly pagination?: Pagination;
}

export interface DeviationsResult {
  readonly deviations: PaginatedResult<Deviation>;
  readonly summary: DeviationSummary;
}

export interface Deviation {
  readonly id: string;
  readonly caseId: string;
  readonly type: DeviationType;
  readonly activity: string;
  readonly expectedActivity?: string;
  readonly position: number;
  readonly timestamp: ISODateTime;
  readonly context: DeviationContext;
}

export interface DeviationContext {
  readonly precedingActivities: readonly string[];
  readonly followingActivities: readonly string[];
  readonly objectsInvolved?: readonly AffectedObject[];
}

export interface AffectedObject {
  readonly objectType: string;
  readonly objectId: string;
}

export interface DeviationSummary {
  readonly totalDeviations: number;
  readonly byType: Record<DeviationType, number>;
  readonly byActivity: Record<string, number>;
  readonly mostCommonPatterns: readonly DeviationPattern[];
}

export interface DeviationPattern {
  readonly pattern: string;
  readonly frequency: number;
  readonly affectedCases: number;
}

export interface DeviationStatsInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly groupBy: 'activity' | 'type' | 'time' | 'object_type';
  readonly filters?: readonly ConformanceOCELFilter[];
}

export interface DeviationStatistics {
  readonly groupBy: string;
  readonly groups: readonly DeviationGroup[];
  readonly trend?: readonly ConformanceTrendPoint[];
}

export interface DeviationGroup {
  readonly key: string;
  readonly count: number;
  readonly percentage: Percentage;
  readonly avgImpact?: number;
}

export interface ConformanceTrendPoint {
  readonly timestamp: ISODateTime;
  readonly count: number;
  readonly rate: Percentage;
}

export interface CaseConformanceInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly caseId: string;
}

export interface CaseConformanceResult {
  readonly caseId: string;
  readonly isConformant: boolean;
  readonly fitness: number;
  readonly alignment?: Alignment;
  readonly deviations: readonly Deviation[];
  readonly visualizationData: CaseVisualizationData;
}

export interface CaseVisualizationData {
  readonly events: readonly VisualEvent[];
  readonly deviationMarkers: readonly DeviationMarker[];
}

export interface VisualEvent {
  readonly activity: string;
  readonly timestamp: ISODateTime;
  readonly status: 'conformant' | 'deviation' | 'missing';
  readonly modelPosition?: number;
}

export interface DeviationMarker {
  readonly position: number;
  readonly type: DeviationType;
  readonly description: string;
}
