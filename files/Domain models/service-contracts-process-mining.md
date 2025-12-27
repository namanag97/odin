# L2 SERVICE CONTRACTS — PROCESS MINING (PM4Py)
> Discovery, conformance, analytics, and OCEL operations

---

## PROCESS DISCOVERY SERVICE

```typescript
/**
 * Process discovery using PM4Py algorithms.
 * Supports both case-centric and object-centric discovery.
 */
interface IProcessDiscoveryService extends IService {
  // Discovery
  discoverProcess(input: DiscoverProcessInput, ctx: OperationContext): AsyncResult<DiscoveryResult>;
  discoverDFG(input: DiscoverDFGInput, ctx: OperationContext): AsyncResult<DFGResult>;
  discoverOCPN(input: DiscoverOCPNInput, ctx: OperationContext): AsyncResult<OCPNResult>;
  
  // Model Management
  saveProcessModel(input: SaveProcessModelInput, ctx: OperationContext): AsyncResult<ProcessModel>;
  updateProcessModel(input: UpdateProcessModelInput, ctx: OperationContext): AsyncResult<ProcessModel>;
  deleteProcessModel(id: ProcessModelId, ctx: OperationContext): AsyncResult<void>;
  
  // Queries
  getProcessModel(id: ProcessModelId, ctx: OperationContext): AsyncResult<ProcessModel>;
  listProcessModels(input: ListProcessModelsInput, ctx: OperationContext): AsyncResult<PaginatedResult<ProcessModel>>;
  
  // Conversion
  convertModel(input: ConvertModelInput, ctx: OperationContext): AsyncResult<ProcessModelContent>;
  
  // Export
  exportModel(input: ExportModelInput, ctx: OperationContext): AsyncResult<ExportedModel>;
  
  // Comparison
  compareModels(input: CompareModelsInput, ctx: OperationContext): AsyncResult<ModelComparison>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

interface DiscoverProcessInput {
  readonly dataModelId: DataModelId;
  readonly algorithm: DiscoveryAlgorithm;
  readonly parameters?: DiscoveryParameters;
  readonly filters?: readonly OCELFilter[];
  readonly outputFormat?: ModelFormat;
  readonly saveName?: string;                 // Auto-save if provided
}

interface DiscoveryParameters {
  // Alpha Miner
  readonly alphaVariant?: 'classic' | 'plus';
  
  // Inductive Miner
  readonly noiseThreshold?: number;           // 0.0 - 1.0
  readonly multiProcessing?: boolean;
  
  // Heuristic Miner
  readonly dependencyThreshold?: number;
  readonly andThreshold?: number;
  readonly loopTwoThreshold?: number;
  
  // ILP Miner
  readonly ilpSolver?: 'glpk' | 'cplex' | 'gurobi';
  
  // Common
  readonly activityFilter?: ActivityFilterConfig;
  readonly edgeFilter?: EdgeFilterConfig;
}

interface ActivityFilterConfig {
  readonly minFrequency?: number;
  readonly minPercentage?: Percentage;
  readonly excludeActivities?: readonly string[];
}

interface EdgeFilterConfig {
  readonly minFrequency?: number;
  readonly minPercentage?: Percentage;
}

interface DiscoveryResult {
  readonly processModel: ProcessModel;
  readonly statistics: DiscoveryStatistics;
  readonly warnings?: readonly string[];
  readonly duration: Duration;
}

interface DiscoveryStatistics {
  readonly eventsProcessed: number;
  readonly casesProcessed: number;
  readonly activitiesDiscovered: number;
  readonly transitionsDiscovered: number;
  readonly placesDiscovered?: number;        // For Petri nets
  readonly silentTransitions?: number;
}

interface DiscoverDFGInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly OCELFilter[];
  readonly performanceMetrics?: boolean;
  readonly aggregation?: DFGAggregation;
}

type DFGAggregation = 'frequency' | 'performance' | 'both';

interface DFGResult {
  readonly dfg: DirectlyFollowsGraph;
  readonly statistics: DFGStatistics;
  readonly duration: Duration;
}

interface DFGStatistics {
  readonly totalActivities: number;
  readonly totalEdges: number;
  readonly totalEvents: number;
  readonly avgOutDegree: number;
  readonly avgInDegree: number;
  readonly maxPathLength?: number;
}

interface DiscoverOCPNInput {
  readonly dataModelId: DataModelId;
  readonly objectTypes: readonly string[];
  readonly filters?: readonly OCELFilter[];
  readonly algorithm?: 'basic' | 'extended';
}

interface OCPNResult {
  readonly model: OCELPetriNet;
  readonly objectTypeStatistics: Record<string, ObjectTypeDiscoveryStats>;
  readonly duration: Duration;
}

interface ObjectTypeDiscoveryStats {
  readonly objectCount: number;
  readonly eventCount: number;
  readonly placesDiscovered: number;
  readonly transitionsDiscovered: number;
}

interface SaveProcessModelInput {
  readonly dataModelId: DataModelId;
  readonly name: string;
  readonly description?: string;
  readonly content: ProcessModelContent;
  readonly metadata?: Partial<ProcessModelMetadata>;
}

interface UpdateProcessModelInput {
  readonly id: ProcessModelId;
  readonly name?: string;
  readonly description?: string;
}

interface ListProcessModelsInput {
  readonly dataModelId?: DataModelId;
  readonly format?: ModelFormat;
  readonly source?: ModelSource;
  readonly search?: string;
  readonly pagination?: Pagination;
}

interface ConvertModelInput {
  readonly modelId: ProcessModelId;
  readonly targetFormat: ModelFormat;
}

interface ExportModelInput {
  readonly modelId: ProcessModelId;
  readonly format: ExportFormat;
  readonly options?: ExportOptions;
}

type ExportFormat = 'pnml' | 'bpmn' | 'svg' | 'png' | 'dot' | 'json';

interface ExportOptions {
  readonly includeLayout?: boolean;
  readonly includeStatistics?: boolean;
  readonly imageWidth?: number;
  readonly imageHeight?: number;
  readonly theme?: 'light' | 'dark';
}

interface ExportedModel {
  readonly content: string | Buffer;
  readonly mimeType: string;
  readonly filename: string;
}

interface CompareModelsInput {
  readonly modelAId: ProcessModelId;
  readonly modelBId: ProcessModelId;
}

interface ModelComparison {
  readonly similarity: number;
  readonly addedElements: readonly ModelElement[];
  readonly removedElements: readonly ModelElement[];
  readonly modifiedElements: readonly ModifiedElement[];
}

interface ModelElement {
  readonly type: 'place' | 'transition' | 'arc';
  readonly id: string;
  readonly label?: string;
}

interface ModifiedElement {
  readonly element: ModelElement;
  readonly changes: Record<string, { before: unknown; after: unknown }>;
}
```

---

## CONFORMANCE CHECKING SERVICE

```typescript
/**
 * Conformance checking using PM4Py methods.
 */
interface IConformanceService extends IService {
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
// DTOs
// ═══════════════════════════════════════════════════════════════

interface CheckConformanceInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly method: ConformanceMethod;
  readonly filters?: readonly OCELFilter[];
  readonly options?: ConformanceOptions;
}

interface ConformanceOptions {
  readonly sampleSize?: number;               // For large logs
  readonly timeout?: Duration;
  readonly parallelism?: number;
}

interface ConformanceResult {
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

interface ConformanceDetails {
  readonly byActivity?: Record<string, ActivityConformance>;
  readonly byVariant?: readonly VariantConformance[];
}

interface ActivityConformance {
  readonly activity: string;
  readonly conformant: number;
  readonly nonConformant: number;
  readonly rate: Percentage;
}

interface VariantConformance {
  readonly variantId: VariantId;
  readonly caseCount: number;
  readonly isConformant: boolean;
  readonly fitness: number;
  readonly deviationCount: number;
}

interface TokenReplayInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly filters?: readonly OCELFilter[];
}

interface TokenReplayResult {
  readonly traceFitness: number;
  readonly moveModelFitness: number;
  readonly moveLogFitness: number;
  readonly percentageTraceFitness: Percentage;
  readonly replayDetails: readonly TraceReplayDetail[];
  readonly duration: Duration;
}

interface TraceReplayDetail {
  readonly caseId: string;
  readonly fitness: number;
  readonly producedTokens: number;
  readonly consumedTokens: number;
  readonly missingTokens: number;
  readonly remainingTokens: number;
}

interface AlignmentsInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly filters?: readonly OCELFilter[];
  readonly costFunction?: CostFunction;
  readonly maxCases?: number;
}

interface CostFunction {
  readonly moveOnLog: number;
  readonly moveOnModel: number;
  readonly synchronousMove: number;
  readonly activityCosts?: Record<string, ActivityCost>;
}

interface ActivityCost {
  readonly moveOnLog: number;
  readonly moveOnModel: number;
}

interface AlignmentsResult {
  readonly fitness: number;
  readonly alignments: readonly Alignment[];
  readonly statistics: AlignmentStatistics;
  readonly duration: Duration;
}

interface Alignment {
  readonly caseId: string;
  readonly cost: number;
  readonly fitness: number;
  readonly moves: readonly AlignmentMove[];
}

interface AlignmentMove {
  readonly type: MoveType;
  readonly logActivity?: string;
  readonly modelActivity?: string;
  readonly cost: number;
}

type MoveType = 'sync' | 'log' | 'model' | 'silent';

interface AlignmentStatistics {
  readonly avgCost: number;
  readonly avgFitness: number;
  readonly syncMoves: number;
  readonly logMoves: number;
  readonly modelMoves: number;
  readonly silentMoves: number;
}

interface FitnessInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly method?: 'token_replay' | 'alignments';
  readonly filters?: readonly OCELFilter[];
}

interface FitnessResult {
  readonly fitness: number;
  readonly method: string;
  readonly details: FitnessDetails;
  readonly duration: Duration;
}

interface FitnessDetails {
  readonly percentageFitTraces: Percentage;
  readonly logFitness: number;
  readonly modelFitness: number;
  readonly traceFitness: number;
}

interface PrecisionInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly method?: 'etconformance' | 'align_etconformance';
  readonly filters?: readonly OCELFilter[];
}

interface PrecisionResult {
  readonly precision: number;
  readonly method: string;
  readonly duration: Duration;
}

interface GeneralizationInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly filters?: readonly OCELFilter[];
}

interface GeneralizationResult {
  readonly generalization: number;
  readonly duration: Duration;
}

interface SimplicityInput {
  readonly processModelId: ProcessModelId;
}

interface SimplicityResult {
  readonly simplicity: number;
  readonly metrics: SimplicityMetrics;
}

interface SimplicityMetrics {
  readonly places?: number;
  readonly transitions?: number;
  readonly arcs?: number;
  readonly silentTransitions?: number;
  readonly duplicateTransitions?: number;
}

interface AllMetricsInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly filters?: readonly OCELFilter[];
}

interface AllMetricsResult {
  readonly fitness: number;
  readonly precision: number;
  readonly generalization: number;
  readonly simplicity: number;
  readonly fMeasure: number;                  // Harmonic mean
  readonly duration: Duration;
}

interface GetDeviationsInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly filters?: readonly OCELFilter[];
  readonly pagination?: Pagination;
}

interface DeviationsResult {
  readonly deviations: PaginatedResult<Deviation>;
  readonly summary: DeviationSummary;
}

interface Deviation {
  readonly id: UUID;
  readonly caseId: string;
  readonly type: DeviationType;
  readonly activity: string;
  readonly expectedActivity?: string;
  readonly position: number;
  readonly timestamp: ISODateTime;
  readonly context: DeviationContext;
}

type DeviationType = 
  | 'missing_activity'       // Activity in model not in log
  | 'unexpected_activity'    // Activity in log not in model
  | 'wrong_order'            // Activities in wrong sequence
  | 'repeated_activity'      // Unexpected repetition
  | 'skipped_activity';      // Expected activity skipped

interface DeviationContext {
  readonly precedingActivities: readonly string[];
  readonly followingActivities: readonly string[];
  readonly objectsInvolved?: readonly AffectedObject[];
}

interface DeviationSummary {
  readonly totalDeviations: number;
  readonly byType: Record<DeviationType, number>;
  readonly byActivity: Record<string, number>;
  readonly mostCommonPatterns: readonly DeviationPattern[];
}

interface DeviationPattern {
  readonly pattern: string;
  readonly frequency: number;
  readonly affectedCases: number;
}

interface DeviationStatsInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly groupBy: 'activity' | 'type' | 'time' | 'object_type';
  readonly filters?: readonly OCELFilter[];
}

interface DeviationStatistics {
  readonly groupBy: string;
  readonly groups: readonly DeviationGroup[];
  readonly trend?: readonly TrendPoint[];
}

interface DeviationGroup {
  readonly key: string;
  readonly count: number;
  readonly percentage: Percentage;
  readonly avgImpact?: number;
}

interface TrendPoint {
  readonly timestamp: ISODateTime;
  readonly count: number;
  readonly rate: Percentage;
}

interface CaseConformanceInput {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly caseId: string;
}

interface CaseConformanceResult {
  readonly caseId: string;
  readonly isConformant: boolean;
  readonly fitness: number;
  readonly alignment?: Alignment;
  readonly deviations: readonly Deviation[];
  readonly visualizationData: CaseVisualizationData;
}

interface CaseVisualizationData {
  readonly events: readonly VisualEvent[];
  readonly deviationMarkers: readonly DeviationMarker[];
}

interface VisualEvent {
  readonly activity: string;
  readonly timestamp: ISODateTime;
  readonly status: 'conformant' | 'deviation' | 'missing';
  readonly modelPosition?: number;
}

interface DeviationMarker {
  readonly position: number;
  readonly type: DeviationType;
  readonly description: string;
}
```

---

## OCEL ANALYTICS SERVICE

```typescript
/**
 * Object-centric event log analytics.
 */
interface IOCELAnalyticsService extends IService {
  // Event Queries
  getEvents(input: GetEventsInput, ctx: OperationContext): AsyncResult<PaginatedResult<OCELEvent>>;
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
  getPerformanceMetrics(input: PerformanceMetricsInput, ctx: OperationContext): AsyncResult<PerformanceMetrics>;
  
  // Filtering
  applyFilter(input: ApplyFilterInput, ctx: OperationContext): AsyncResult<FilterResult>;
  getFilteredStatistics(input: FilteredStatsInput, ctx: OperationContext): AsyncResult<FilteredStatistics>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

interface GetEventsInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly OCELFilter[];
  readonly dateRange?: DateRange;
  readonly activities?: readonly string[];
  readonly objectTypes?: readonly string[];
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

interface GetEventDetailsInput {
  readonly dataModelId: DataModelId;
  readonly eventId: EventId;
  readonly includeObjects?: boolean;
}

interface EventsByObjectInput {
  readonly dataModelId: DataModelId;
  readonly objectType: string;
  readonly objectId: ObjectId;
  readonly dateRange?: DateRange;
}

interface GetObjectsInput {
  readonly dataModelId: DataModelId;
  readonly objectType: string;
  readonly filters?: readonly OCELFilter[];
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

interface GetObjectDetailsInput {
  readonly dataModelId: DataModelId;
  readonly objectType: string;
  readonly objectId: ObjectId;
}

interface ObjectDetails extends OCELObject {
  readonly events: readonly OCELEvent[];
  readonly relatedObjects: readonly RelatedObject[];
  readonly metrics: ObjectMetrics;
}

interface RelatedObject {
  readonly object: OCELObject;
  readonly relation: string;
  readonly sharedEventCount: number;
}

interface ObjectMetrics {
  readonly eventCount: number;
  readonly uniqueActivities: number;
  readonly lifecycleDuration: Duration;
  readonly firstEventAt: ISODateTime;
  readonly lastEventAt: ISODateTime;
}

interface ObjectLifecycleInput {
  readonly dataModelId: DataModelId;
  readonly objectType: string;
  readonly objectId: ObjectId;
}

interface ObjectLifecycleDetails {
  readonly object: OCELObject;
  readonly timeline: readonly LifecycleEvent[];
  readonly stateTransitions: readonly StateTransition[];
  readonly metrics: LifecycleMetrics;
}

interface LifecycleEvent {
  readonly eventId: EventId;
  readonly activity: string;
  readonly timestamp: ISODateTime;
  readonly coObjects: readonly EventObject[];
  readonly attributes: Record<string, unknown>;
}

interface StateTransition {
  readonly fromActivity: string;
  readonly toActivity: string;
  readonly duration: Duration;
  readonly timestamp: ISODateTime;
}

interface LifecycleMetrics {
  readonly totalDuration: Duration;
  readonly avgTimeBetweenEvents: Duration;
  readonly longestWait: { duration: Duration; after: string; before: string };
  readonly activityFrequency: Record<string, number>;
}

interface ObjectGraphInput {
  readonly dataModelId: DataModelId;
  readonly objectType: string;
  readonly objectId: ObjectId;
  readonly depth?: number;
  readonly includeTypes?: readonly string[];
}

interface ObjectGraph {
  readonly rootObject: OCELObject;
  readonly nodes: readonly ObjectGraphNode[];
  readonly edges: readonly ObjectGraphEdge[];
}

interface ObjectGraphNode {
  readonly object: OCELObject;
  readonly depth: number;
  readonly sharedEvents: number;
}

interface ObjectGraphEdge {
  readonly sourceId: ObjectId;
  readonly targetId: ObjectId;
  readonly relation: string;
  readonly weight: number;
}

interface ActivityStatsInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly OCELFilter[];
  readonly includePerformance?: boolean;
}

interface ActivityTransitionsInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly OCELFilter[];
  readonly minFrequency?: number;
}

interface TransitionStatistic {
  readonly fromActivity: string;
  readonly toActivity: string;
  readonly frequency: number;
  readonly percentage: Percentage;
  readonly performance?: TransitionPerformance;
}

interface TransitionPerformance {
  readonly avgDuration: Duration;
  readonly minDuration: Duration;
  readonly maxDuration: Duration;
  readonly medianDuration: Duration;
  readonly stdDev: Duration;
}

interface ObjectTypeStatsInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly OCELFilter[];
}

interface ObjectInteractionsInput {
  readonly dataModelId: DataModelId;
  readonly objectTypes?: readonly string[];
  readonly minInteractions?: number;
}

interface ObjectInteractionMatrix {
  readonly objectTypes: readonly string[];
  readonly interactions: readonly ObjectInteraction[];
}

interface ObjectInteraction {
  readonly typeA: string;
  readonly typeB: string;
  readonly sharedEventCount: number;
  readonly avgEventsPerInteraction: number;
  readonly commonActivities: readonly string[];
}

interface TemporalDistributionInput {
  readonly dataModelId: DataModelId;
  readonly granularity: TimeGranularity;
  readonly dateRange?: DateRange;
  readonly groupBy?: 'activity' | 'object_type';
  readonly filters?: readonly OCELFilter[];
}

type TimeGranularity = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

interface TemporalDistribution {
  readonly granularity: TimeGranularity;
  readonly buckets: readonly TemporalBucket[];
  readonly trend: TrendAnalysis;
}

interface TemporalBucket {
  readonly timestamp: ISODateTime;
  readonly count: number;
  readonly breakdown?: Record<string, number>;
}

interface TrendAnalysis {
  readonly direction: 'increasing' | 'decreasing' | 'stable';
  readonly percentageChange: Percentage;
  readonly seasonality?: SeasonalityInfo;
}

interface SeasonalityInfo {
  readonly detected: boolean;
  readonly period?: TimeGranularity;
  readonly peakPeriods?: readonly string[];
}

interface PerformanceMetricsInput {
  readonly dataModelId: DataModelId;
  readonly objectType?: string;
  readonly metrics: readonly PerformanceMetricType[];
  readonly filters?: readonly OCELFilter[];
  readonly groupBy?: string;
}

type PerformanceMetricType = 
  | 'throughput_time' | 'waiting_time' | 'service_time'
  | 'cycle_time' | 'lead_time' | 'touch_time';

interface PerformanceMetrics {
  readonly metrics: Record<PerformanceMetricType, MetricValue>;
  readonly distribution?: Record<PerformanceMetricType, DistributionData>;
  readonly byGroup?: Record<string, Record<PerformanceMetricType, MetricValue>>;
}

interface MetricValue {
  readonly avg: Duration;
  readonly min: Duration;
  readonly max: Duration;
  readonly median: Duration;
  readonly percentile95: Duration;
  readonly stdDev: Duration;
}

interface DistributionData {
  readonly buckets: readonly HistogramBucket[];
  readonly outliers: number;
}

interface ApplyFilterInput {
  readonly dataModelId: DataModelId;
  readonly filters: readonly OCELFilter[];
}

interface FilterResult {
  readonly originalCount: number;
  readonly filteredCount: number;
  readonly reductionPercentage: Percentage;
  readonly filterBreakdown: readonly FilterImpact[];
}

interface FilterImpact {
  readonly filter: OCELFilter;
  readonly removedCount: number;
  readonly remainingCount: number;
}

interface FilteredStatsInput {
  readonly dataModelId: DataModelId;
  readonly filters: readonly OCELFilter[];
}

interface FilteredStatistics {
  readonly eventCount: number;
  readonly objectCounts: Record<string, number>;
  readonly activityCounts: Record<string, number>;
  readonly dateRange: DateRange;
  readonly comparisonToUnfiltered: StatisticsComparison;
}

interface StatisticsComparison {
  readonly eventReduction: Percentage;
  readonly objectReduction: Record<string, Percentage>;
  readonly activityReduction: Record<string, Percentage>;
}
```

---

## CASE ANALYTICS SERVICE

```typescript
/**
 * Case-centric analytics (derived from or native to case-centric models).
 */
interface ICaseAnalyticsService extends IService {
  // Case Queries
  getCases(input: GetCasesInput, ctx: OperationContext): AsyncResult<PaginatedResult<Case>>;
  getCaseDetails(input: GetCaseDetailsInput, ctx: OperationContext): AsyncResult<CaseDetails>;
  getCaseEvents(input: GetCaseEventsInput, ctx: OperationContext): AsyncResult<readonly CaseEvent[]>;
  
  // Variant Analysis
  getVariants(input: GetVariantsInput, ctx: OperationContext): AsyncResult<PaginatedResult<Variant>>;
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
// DTOs
// ═══════════════════════════════════════════════════════════════

interface GetCasesInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly CaseFilter[];
  readonly dateRange?: DateRange;
  readonly variantIds?: readonly VariantId[];
  readonly throughputRange?: DurationRange;
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

interface CaseFilter {
  readonly type: 'attribute' | 'variant' | 'throughput' | 'activity' | 'custom';
  readonly config: Record<string, unknown>;
}

interface DurationRange {
  readonly min?: Duration;
  readonly max?: Duration;
}

interface GetCaseDetailsInput {
  readonly dataModelId: DataModelId;
  readonly caseId: string;
}

interface CaseDetails extends Case {
  readonly timeline: readonly TimelineEvent[];
  readonly performanceBreakdown: PerformanceBreakdown;
  readonly conformance?: CaseConformanceResult;
}

interface TimelineEvent {
  readonly event: CaseEvent;
  readonly durationFromStart: Duration;
  readonly durationFromPrevious: Duration;
  readonly isBottleneck: boolean;
}

interface PerformanceBreakdown {
  readonly waitingTime: Duration;
  readonly processingTime: Duration;
  readonly byActivity: Record<string, ActivityPerformance>;
}

interface ActivityPerformance {
  readonly count: number;
  readonly totalDuration: Duration;
  readonly avgDuration: Duration;
  readonly waitBefore: Duration;
}

interface GetCaseEventsInput {
  readonly dataModelId: DataModelId;
  readonly caseId: string;
}

interface GetVariantsInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly CaseFilter[];
  readonly minCaseCount?: number;
  readonly maxVariants?: number;
  readonly includePerformance?: boolean;
  readonly pagination?: Pagination;
}

interface GetVariantDetailsInput {
  readonly dataModelId: DataModelId;
  readonly variantId: VariantId;
}

interface VariantDetails extends Variant {
  readonly cases: readonly CaseSummary[];
  readonly performanceDistribution: DistributionData;
  readonly commonAttributes: Record<string, AttributeDistribution>;
}

interface CaseSummary {
  readonly caseId: string;
  readonly throughputTime: Duration;
  readonly startTime: ISODateTime;
  readonly endTime: ISODateTime;
}

interface AttributeDistribution {
  readonly values: readonly { value: unknown; count: number; percentage: Percentage }[];
  readonly entropy: number;
}

interface CompareVariantsInput {
  readonly dataModelId: DataModelId;
  readonly variantAId: VariantId;
  readonly variantBId: VariantId;
}

interface VariantComparison {
  readonly variantA: Variant;
  readonly variantB: Variant;
  readonly sequenceDiff: SequenceDiff;
  readonly performanceDiff: PerformanceDiff;
  readonly attributeDiff: Record<string, AttributeDiff>;
}

interface SequenceDiff {
  readonly commonActivities: readonly string[];
  readonly onlyInA: readonly string[];
  readonly onlyInB: readonly string[];
  readonly orderDifferences: readonly OrderDiff[];
}

interface OrderDiff {
  readonly activity: string;
  readonly positionInA: number;
  readonly positionInB: number;
}

interface PerformanceDiff {
  readonly throughputTimeDiff: Duration;
  readonly throughputTimeRatio: number;
  readonly byActivity: Record<string, { diff: Duration; ratio: number }>;
}

interface AttributeDiff {
  readonly significantlyDifferent: boolean;
  readonly pValue?: number;
  readonly distributionA: AttributeDistribution;
  readonly distributionB: AttributeDistribution;
}

interface ThroughputAnalysisInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly CaseFilter[];
  readonly groupBy?: 'variant' | 'time' | 'attribute';
  readonly attribute?: string;
}

interface ThroughputAnalysis {
  readonly overall: MetricValue;
  readonly distribution: DistributionData;
  readonly byGroup?: readonly ThroughputGroup[];
  readonly trend?: TrendAnalysis;
}

interface ThroughputGroup {
  readonly groupKey: string;
  readonly caseCount: number;
  readonly metrics: MetricValue;
}

interface BottleneckAnalysisInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly CaseFilter[];
  readonly threshold?: Percentage;           // Top N% slowest transitions
}

interface BottleneckAnalysis {
  readonly bottlenecks: readonly Bottleneck[];
  readonly totalWaitingTime: Duration;
  readonly bottleneckContribution: Percentage;
}

interface Bottleneck {
  readonly fromActivity: string;
  readonly toActivity: string;
  readonly avgWaitTime: Duration;
  readonly medianWaitTime: Duration;
  readonly affectedCases: number;
  readonly percentageOfTotalWait: Percentage;
  readonly variability: number;              // Coefficient of variation
}

interface ClusterCasesInput {
  readonly dataModelId: DataModelId;
  readonly method: ClusteringMethod;
  readonly features: readonly ClusteringFeature[];
  readonly numClusters?: number;
  readonly filters?: readonly CaseFilter[];
}

type ClusteringMethod = 'kmeans' | 'hierarchical' | 'dbscan';

type ClusteringFeature = 
  | 'throughput_time' | 'event_count' | 'variant'
  | 'start_activity' | 'end_activity' | 'activities'
  | { attribute: string };

interface ClusteringResult {
  readonly clusters: readonly Cluster[];
  readonly silhouetteScore: number;
  readonly totalCases: number;
}

interface Cluster {
  readonly id: number;
  readonly caseCount: number;
  readonly percentage: Percentage;
  readonly centroid: Record<string, unknown>;
  readonly characteristics: ClusterCharacteristics;
  readonly representativeCases: readonly string[];
}

interface ClusterCharacteristics {
  readonly avgThroughputTime: Duration;
  readonly dominantVariants: readonly { variantId: VariantId; percentage: Percentage }[];
  readonly commonActivities: readonly string[];
  readonly distinctiveAttributes: Record<string, unknown>;
}

interface RootCauseInput {
  readonly dataModelId: DataModelId;
  readonly targetMetric: 'throughput_time' | 'conformance' | 'outcome';
  readonly targetCondition: TargetCondition;
  readonly candidateAttributes: readonly string[];
  readonly filters?: readonly CaseFilter[];
}

interface TargetCondition {
  readonly type: 'above_threshold' | 'below_threshold' | 'equals';
  readonly value: unknown;
}

interface RootCauseAnalysis {
  readonly targetMetric: string;
  readonly targetCondition: TargetCondition;
  readonly affectedCases: number;
  readonly factors: readonly RootCauseFactor[];
  readonly decisionTree?: DecisionTreeNode;
}

interface RootCauseFactor {
  readonly attribute: string;
  readonly correlation: number;
  readonly significance: number;           // p-value
  readonly effect: 'increases' | 'decreases';
  readonly topValues: readonly { value: unknown; impact: number }[];
}

interface DecisionTreeNode {
  readonly attribute?: string;
  readonly threshold?: unknown;
  readonly condition?: string;
  readonly probability: number;
  readonly sampleCount: number;
  readonly left?: DecisionTreeNode;
  readonly right?: DecisionTreeNode;
}
```
