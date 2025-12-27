# PM4PY ADAPTER CONTRACTS — PYTHON BRIDGE
> Interface contracts for TypeScript ↔ PM4Py Python communication

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                    TypeScript Application                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              ProcessDiscoveryService                     │    │
│  │              ConformanceService                          │    │
│  │              OCELAnalyticsService                        │    │
│  └─────────────────────┬───────────────────────────────────┘    │
│                        │                                         │
│  ┌─────────────────────▼───────────────────────────────────┐    │
│  │                 IPM4PyAdapter                            │    │
│  │            (TypeScript Interface)                        │    │
│  └─────────────────────┬───────────────────────────────────┘    │
├────────────────────────┼────────────────────────────────────────┤
│                        │  HTTP/gRPC/ZeroMQ                       │
├────────────────────────┼────────────────────────────────────────┤
│  ┌─────────────────────▼───────────────────────────────────┐    │
│  │              PM4Py Python Service                        │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  pm4py.algo.discovery                           │    │    │
│  │  │  pm4py.algo.conformance                         │    │    │
│  │  │  pm4py.objects.ocel                             │    │    │
│  │  │  pm4py.statistics                               │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                      Python Process                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## PM4PY ADAPTER INTERFACE

```typescript
/**
 * TypeScript interface for PM4Py Python bridge.
 * Implementations: HTTP REST, gRPC, ZeroMQ, or child process.
 */
interface IPM4PyAdapter {
  // Health & Status
  ping(): AsyncResult<PM4PyStatus>;
  getVersion(): AsyncResult<PM4PyVersion>;
  
  // Event Log Operations
  loadEventLog(input: LoadEventLogInput): AsyncResult<EventLogHandle>;
  loadOCEL(input: LoadOCELInput): AsyncResult<OCELHandle>;
  disposeHandle(handle: string): AsyncResult<void>;
  
  // Process Discovery
  discoverAlpha(input: DiscoverAlphaInput): AsyncResult<PetriNetResult>;
  discoverAlphaPlus(input: DiscoverAlphaPlusInput): AsyncResult<PetriNetResult>;
  discoverInductive(input: DiscoverInductiveInput): AsyncResult<ProcessTreeResult>;
  discoverInductiveInfrequent(input: DiscoverInductiveInfrequentInput): AsyncResult<ProcessTreeResult>;
  discoverHeuristic(input: DiscoverHeuristicInput): AsyncResult<PetriNetResult>;
  discoverILP(input: DiscoverILPInput): AsyncResult<PetriNetResult>;
  discoverDFG(input: DiscoverDFGInput): AsyncResult<DFGResult>;
  discoverOCPN(input: DiscoverOCPNInput): AsyncResult<OCPNResult>;
  
  // Model Conversion
  convertProcessTreeToPetriNet(tree: ProcessTreeDTO): AsyncResult<PetriNetResult>;
  convertPetriNetToBPMN(petriNet: PetriNetDTO): AsyncResult<BPMNResult>;
  convertToDFG(petriNet: PetriNetDTO): AsyncResult<DFGResult>;
  
  // Conformance Checking
  tokenBasedReplay(input: TokenReplayInput): AsyncResult<TokenReplayResult>;
  computeAlignments(input: AlignmentsInput): AsyncResult<AlignmentsResult>;
  checkFootprints(input: FootprintsInput): AsyncResult<FootprintsResult>;
  
  // Quality Metrics
  calculateFitness(input: FitnessInput): AsyncResult<FitnessResult>;
  calculatePrecision(input: PrecisionInput): AsyncResult<PrecisionResult>;
  calculateGeneralization(input: GeneralizationInput): AsyncResult<GeneralizationResult>;
  calculateSimplicity(input: SimplicityInput): AsyncResult<SimplicityResult>;
  
  // Statistics
  getStartActivities(handle: string): AsyncResult<ActivityFrequencies>;
  getEndActivities(handle: string): AsyncResult<ActivityFrequencies>;
  getActivityFrequencies(handle: string): AsyncResult<ActivityFrequencies>;
  getVariants(input: GetVariantsInput): AsyncResult<VariantsResult>;
  getCaseDurations(input: CaseDurationsInput): AsyncResult<DurationStatistics>;
  
  // OCEL Operations
  getObjectTypes(handle: string): AsyncResult<string[]>;
  getOCELStatistics(handle: string): AsyncResult<OCELStatistics>;
  discoverOCDFG(input: DiscoverOCDFGInput): AsyncResult<OCDFGResult>;
  flattenOCEL(input: FlattenOCELInput): AsyncResult<EventLogHandle>;
  
  // Filtering
  filterByActivities(input: FilterActivitiesInput): AsyncResult<EventLogHandle>;
  filterByTimeRange(input: FilterTimeRangeInput): AsyncResult<EventLogHandle>;
  filterByVariants(input: FilterVariantsInput): AsyncResult<EventLogHandle>;
  filterByAttributes(input: FilterAttributesInput): AsyncResult<EventLogHandle>;
  
  // Export
  exportToPNML(petriNet: PetriNetDTO): AsyncResult<string>;
  exportToBPMN(bpmn: BPMNDTO): AsyncResult<string>;
  exportToSVG(input: ExportSVGInput): AsyncResult<string>;
  exportToPNG(input: ExportPNGInput): AsyncResult<Buffer>;
  
  // Social Network Analysis
  discoverHandoverNetwork(handle: string): AsyncResult<SocialNetworkResult>;
  discoverWorkingTogetherNetwork(handle: string): AsyncResult<SocialNetworkResult>;
  discoverSubcontractingNetwork(handle: string): AsyncResult<SocialNetworkResult>;
  
  // Performance Analysis
  calculateSojournTimes(handle: string): AsyncResult<SojournTimesResult>;
  calculateWaitingTimes(handle: string): AsyncResult<WaitingTimesResult>;
  calculateServiceTimes(handle: string): AsyncResult<ServiceTimesResult>;
}

// ═══════════════════════════════════════════════════════════════
// STATUS & VERSION
// ═══════════════════════════════════════════════════════════════

interface PM4PyStatus {
  readonly healthy: boolean;
  readonly uptime: Duration;
  readonly activeHandles: number;
  readonly memoryUsage: number;
  readonly queuedTasks: number;
}

interface PM4PyVersion {
  readonly pm4py: string;
  readonly python: string;
  readonly dependencies: Record<string, string>;
}

// ═══════════════════════════════════════════════════════════════
// HANDLES (Pointers to Python Objects)
// ═══════════════════════════════════════════════════════════════

type EventLogHandle = Brand<string, 'EventLogHandle'>;
type OCELHandle = Brand<string, 'OCELHandle'>;
type PetriNetHandle = Brand<string, 'PetriNetHandle'>;
type ProcessTreeHandle = Brand<string, 'ProcessTreeHandle'>;

// ═══════════════════════════════════════════════════════════════
// EVENT LOG INPUT
// ═══════════════════════════════════════════════════════════════

interface LoadEventLogInput {
  readonly data: EventLogData;
  readonly caseIdColumn: string;
  readonly activityColumn: string;
  readonly timestampColumn: string;
  readonly sortingColumn?: string;
  readonly additionalColumns?: readonly string[];
}

type EventLogData = 
  | { type: 'dataframe'; rows: readonly Record<string, unknown>[]; columns: readonly string[] }
  | { type: 'csv'; content: string; delimiter?: string }
  | { type: 'xes'; content: string }
  | { type: 'parquet'; content: Buffer };

interface LoadOCELInput {
  readonly format: 'json' | 'xml' | 'sqlite';
  readonly content: string | Buffer;
}
```

---

## DISCOVERY DTOs

```typescript
// ═══════════════════════════════════════════════════════════════
// ALPHA MINER
// ═══════════════════════════════════════════════════════════════

interface DiscoverAlphaInput {
  readonly eventLogHandle: EventLogHandle;
}

interface DiscoverAlphaPlusInput {
  readonly eventLogHandle: EventLogHandle;
}

// ═══════════════════════════════════════════════════════════════
// INDUCTIVE MINER
// ═══════════════════════════════════════════════════════════════

interface DiscoverInductiveInput {
  readonly eventLogHandle: EventLogHandle;
  readonly noiseThreshold?: number;          // 0.0 - 1.0, default 0.0
}

interface DiscoverInductiveInfrequentInput {
  readonly eventLogHandle: EventLogHandle;
  readonly noiseThreshold: number;           // 0.0 - 1.0, typically 0.2
}

// ═══════════════════════════════════════════════════════════════
// HEURISTIC MINER
// ═══════════════════════════════════════════════════════════════

interface DiscoverHeuristicInput {
  readonly eventLogHandle: EventLogHandle;
  readonly dependencyThreshold?: number;     // Default 0.5
  readonly andThreshold?: number;            // Default 0.65
  readonly loopTwoThreshold?: number;        // Default 0.5
  readonly minActivityCount?: number;
  readonly minDfgOccurrences?: number;
}

// ═══════════════════════════════════════════════════════════════
// ILP MINER
// ═══════════════════════════════════════════════════════════════

interface DiscoverILPInput {
  readonly eventLogHandle: EventLogHandle;
  readonly alpha?: number;                   // Default 1.0
}

// ═══════════════════════════════════════════════════════════════
// DFG DISCOVERY
// ═══════════════════════════════════════════════════════════════

interface DiscoverDFGInput {
  readonly eventLogHandle: EventLogHandle;
  readonly includePerformance?: boolean;
  readonly activityKey?: string;
  readonly timestampKey?: string;
}

// ═══════════════════════════════════════════════════════════════
// OCEL DISCOVERY
// ═══════════════════════════════════════════════════════════════

interface DiscoverOCPNInput {
  readonly ocelHandle: OCELHandle;
}

interface DiscoverOCDFGInput {
  readonly ocelHandle: OCELHandle;
  readonly objectTypes?: readonly string[];
}
```

---

## RESULT DTOs

```typescript
// ═══════════════════════════════════════════════════════════════
// PETRI NET RESULT
// ═══════════════════════════════════════════════════════════════

interface PetriNetResult {
  readonly handle: PetriNetHandle;
  readonly petriNet: PetriNetDTO;
  readonly initialMarking: MarkingDTO;
  readonly finalMarking: MarkingDTO;
  readonly statistics: DiscoveryStatistics;
}

interface PetriNetDTO {
  readonly places: readonly PlaceDTO[];
  readonly transitions: readonly TransitionDTO[];
  readonly arcs: readonly ArcDTO[];
}

interface PlaceDTO {
  readonly id: string;
  readonly name: string;
}

interface TransitionDTO {
  readonly id: string;
  readonly name: string | null;              // null = silent transition
  readonly label: string | null;
}

interface ArcDTO {
  readonly source: string;
  readonly target: string;
  readonly weight: number;
}

interface MarkingDTO {
  readonly tokens: Record<string, number>;   // place_id -> count
}

// ═══════════════════════════════════════════════════════════════
// PROCESS TREE RESULT
// ═══════════════════════════════════════════════════════════════

interface ProcessTreeResult {
  readonly handle: ProcessTreeHandle;
  readonly tree: ProcessTreeDTO;
  readonly statistics: DiscoveryStatistics;
}

interface ProcessTreeDTO {
  readonly operator: ProcessTreeOperator | null;
  readonly label: string | null;
  readonly children: readonly ProcessTreeDTO[];
}

type ProcessTreeOperator = 
  | 'sequence'    // ->
  | 'xor'         // X
  | 'parallel'    // +
  | 'loop'        // *
  | 'or';         // O

// ═══════════════════════════════════════════════════════════════
// DFG RESULT
// ═══════════════════════════════════════════════════════════════

interface DFGResult {
  readonly activities: Record<string, number>;
  readonly startActivities: Record<string, number>;
  readonly endActivities: Record<string, number>;
  readonly edges: readonly DFGEdgeDTO[];
  readonly performance?: DFGPerformanceDTO;
}

interface DFGEdgeDTO {
  readonly source: string;
  readonly target: string;
  readonly frequency: number;
}

interface DFGPerformanceDTO {
  readonly edgePerformance: Record<string, EdgePerformanceDTO>;
}

interface EdgePerformanceDTO {
  readonly mean: number;
  readonly median: number;
  readonly min: number;
  readonly max: number;
  readonly stdev: number;
}

// ═══════════════════════════════════════════════════════════════
// BPMN RESULT
// ═══════════════════════════════════════════════════════════════

interface BPMNResult {
  readonly bpmn: BPMNDTO;
}

interface BPMNDTO {
  readonly process: BPMNProcessDTO;
}

interface BPMNProcessDTO {
  readonly id: string;
  readonly name: string;
  readonly nodes: readonly BPMNNodeDTO[];
  readonly flows: readonly BPMNFlowDTO[];
}

interface BPMNNodeDTO {
  readonly id: string;
  readonly type: BPMNNodeType;
  readonly name?: string;
}

type BPMNNodeType = 
  | 'startEvent' | 'endEvent'
  | 'task'
  | 'exclusiveGateway' | 'parallelGateway' | 'inclusiveGateway';

interface BPMNFlowDTO {
  readonly id: string;
  readonly sourceRef: string;
  readonly targetRef: string;
}

// ═══════════════════════════════════════════════════════════════
// OCPN RESULT
// ═══════════════════════════════════════════════════════════════

interface OCPNResult {
  readonly objectTypes: readonly string[];
  readonly places: readonly OCPlaceDTO[];
  readonly transitions: readonly OCTransitionDTO[];
  readonly arcs: readonly OCArcDTO[];
}

interface OCPlaceDTO {
  readonly id: string;
  readonly name: string;
  readonly objectType: string;
  readonly isInitial: boolean;
  readonly isFinal: boolean;
}

interface OCTransitionDTO {
  readonly id: string;
  readonly name: string | null;
  readonly label: string | null;
  readonly silent: boolean;
}

interface OCArcDTO {
  readonly source: string;
  readonly target: string;
  readonly objectType: string;
  readonly variable: boolean;
}

// ═══════════════════════════════════════════════════════════════
// OCDFS RESULT
// ═══════════════════════════════════════════════════════════════

interface OCDFGResult {
  readonly objectTypes: readonly string[];
  readonly activities: Record<string, OCActivityStatsDTO>;
  readonly edges: readonly OCDFGEdgeDTO[];
}

interface OCActivityStatsDTO {
  readonly frequency: number;
  readonly objectTypeCounts: Record<string, number>;
}

interface OCDFGEdgeDTO {
  readonly source: string;
  readonly target: string;
  readonly objectType: string;
  readonly frequency: number;
}

// ═══════════════════════════════════════════════════════════════
// DISCOVERY STATISTICS
// ═══════════════════════════════════════════════════════════════

interface DiscoveryStatistics {
  readonly eventsProcessed: number;
  readonly casesProcessed: number;
  readonly activitiesFound: number;
  readonly transitionsCreated: number;
  readonly placesCreated?: number;
  readonly silentTransitions?: number;
  readonly executionTime: number;            // milliseconds
}
```

---

## CONFORMANCE DTOs

```typescript
// ═══════════════════════════════════════════════════════════════
// TOKEN-BASED REPLAY
// ═══════════════════════════════════════════════════════════════

interface TokenReplayInput {
  readonly eventLogHandle: EventLogHandle;
  readonly petriNetHandle: PetriNetHandle;
  readonly initialMarking: MarkingDTO;
  readonly finalMarking: MarkingDTO;
}

interface TokenReplayResult {
  readonly traceFitness: number;
  readonly logFitness: number;
  readonly percentageFitTraces: number;
  readonly traceResults: readonly TraceReplayResultDTO[];
}

interface TraceReplayResultDTO {
  readonly caseId: string;
  readonly fitness: number;
  readonly isFit: boolean;
  readonly missingTokens: number;
  readonly consumedTokens: number;
  readonly remainingTokens: number;
  readonly producedTokens: number;
}

// ═══════════════════════════════════════════════════════════════
// ALIGNMENTS
// ═══════════════════════════════════════════════════════════════

interface AlignmentsInput {
  readonly eventLogHandle: EventLogHandle;
  readonly petriNetHandle: PetriNetHandle;
  readonly initialMarking: MarkingDTO;
  readonly finalMarking: MarkingDTO;
  readonly costFunction?: CostFunctionDTO;
  readonly maxTraces?: number;
}

interface CostFunctionDTO {
  readonly standardMoveOnLog: number;
  readonly standardMoveOnModel: number;
  readonly synchronousMoveCost: number;
  readonly activityCosts?: Record<string, ActivityCostDTO>;
}

interface ActivityCostDTO {
  readonly moveOnLog: number;
  readonly moveOnModel: number;
}

interface AlignmentsResult {
  readonly fitness: number;
  readonly averageCost: number;
  readonly alignments: readonly AlignmentDTO[];
}

interface AlignmentDTO {
  readonly caseId: string;
  readonly alignment: readonly AlignmentMoveDTO[];
  readonly cost: number;
  readonly fitness: number;
  readonly bwc: number;                      // Best worst cost
}

interface AlignmentMoveDTO {
  readonly logMove: string | null;
  readonly modelMove: string | null;
  readonly moveType: AlignmentMoveType;
}

type AlignmentMoveType = 
  | 'sync'           // Log and model agree
  | 'log'            // Move on log only (deviation)
  | 'model'          // Move on model only (missing)
  | 'silent';        // Silent transition fired

// ═══════════════════════════════════════════════════════════════
// FOOTPRINTS
// ═══════════════════════════════════════════════════════════════

interface FootprintsInput {
  readonly eventLogHandle: EventLogHandle;
  readonly petriNetHandle: PetriNetHandle;
}

interface FootprintsResult {
  readonly logFootprint: FootprintDTO;
  readonly modelFootprint: FootprintDTO;
  readonly conformanceMatrix: FootprintConformanceDTO;
}

interface FootprintDTO {
  readonly activities: readonly string[];
  readonly directlyFollows: readonly [string, string][];
  readonly parallelRelations: readonly [string, string][];
  readonly causalRelations: readonly [string, string][];
  readonly neverFollow: readonly [string, string][];
}

interface FootprintConformanceDTO {
  readonly fitness: number;
  readonly deviations: readonly FootprintDeviationDTO[];
}

interface FootprintDeviationDTO {
  readonly activityA: string;
  readonly activityB: string;
  readonly logRelation: string;
  readonly modelRelation: string;
}

// ═══════════════════════════════════════════════════════════════
// QUALITY METRICS
// ═══════════════════════════════════════════════════════════════

interface FitnessInput {
  readonly eventLogHandle: EventLogHandle;
  readonly petriNetHandle: PetriNetHandle;
  readonly initialMarking: MarkingDTO;
  readonly finalMarking: MarkingDTO;
  readonly method: 'token_replay' | 'alignments';
}

interface FitnessResult {
  readonly fitness: number;
  readonly method: string;
  readonly details: FitnessDetailsDTO;
}

interface FitnessDetailsDTO {
  readonly percentageFitTraces: number;
  readonly averageTraceFitness: number;
  readonly logFitness?: number;
  readonly modelFitness?: number;
}

interface PrecisionInput {
  readonly eventLogHandle: EventLogHandle;
  readonly petriNetHandle: PetriNetHandle;
  readonly initialMarking: MarkingDTO;
  readonly finalMarking: MarkingDTO;
  readonly method: 'etconformance' | 'align_etconformance';
}

interface PrecisionResult {
  readonly precision: number;
  readonly method: string;
}

interface GeneralizationInput {
  readonly eventLogHandle: EventLogHandle;
  readonly petriNetHandle: PetriNetHandle;
  readonly initialMarking: MarkingDTO;
  readonly finalMarking: MarkingDTO;
}

interface GeneralizationResult {
  readonly generalization: number;
}

interface SimplicityInput {
  readonly petriNetHandle: PetriNetHandle;
}

interface SimplicityResult {
  readonly simplicity: number;
  readonly places: number;
  readonly transitions: number;
  readonly arcs: number;
  readonly silentTransitions: number;
}
```

---

## STATISTICS & FILTERING DTOs

```typescript
// ═══════════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════════

interface ActivityFrequencies {
  readonly activities: Record<string, number>;
}

interface GetVariantsInput {
  readonly eventLogHandle: EventLogHandle;
  readonly maxVariants?: number;
}

interface VariantsResult {
  readonly variants: readonly VariantDTO[];
  readonly totalCases: number;
}

interface VariantDTO {
  readonly activities: readonly string[];
  readonly count: number;
  readonly percentage: number;
}

interface CaseDurationsInput {
  readonly eventLogHandle: EventLogHandle;
}

interface DurationStatistics {
  readonly mean: number;
  readonly median: number;
  readonly min: number;
  readonly max: number;
  readonly stdev: number;
  readonly percentiles: Record<number, number>;
}

interface OCELStatistics {
  readonly eventCount: number;
  readonly objectCounts: Record<string, number>;
  readonly activityCount: number;
  readonly uniqueActivities: readonly string[];
  readonly timeRange: {
    readonly start: string;
    readonly end: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// FILTERING
// ═══════════════════════════════════════════════════════════════

interface FilterActivitiesInput {
  readonly eventLogHandle: EventLogHandle;
  readonly activities: readonly string[];
  readonly mode: 'keep' | 'remove';
}

interface FilterTimeRangeInput {
  readonly eventLogHandle: EventLogHandle;
  readonly start: string;
  readonly end: string;
}

interface FilterVariantsInput {
  readonly eventLogHandle: EventLogHandle;
  readonly variants: readonly readonly string[][];
  readonly mode: 'keep' | 'remove';
}

interface FilterAttributesInput {
  readonly eventLogHandle: EventLogHandle;
  readonly attribute: string;
  readonly values: readonly unknown[];
  readonly mode: 'keep' | 'remove';
}

interface FlattenOCELInput {
  readonly ocelHandle: OCELHandle;
  readonly objectType: string;
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

interface ExportSVGInput {
  readonly type: 'petri_net' | 'process_tree' | 'dfg' | 'bpmn';
  readonly handle?: string;
  readonly dto?: PetriNetDTO | ProcessTreeDTO | DFGResult | BPMNDTO;
  readonly options?: VisualizationOptions;
}

interface ExportPNGInput extends ExportSVGInput {
  readonly width?: number;
  readonly height?: number;
  readonly dpi?: number;
}

interface VisualizationOptions {
  readonly showFrequency?: boolean;
  readonly showPerformance?: boolean;
  readonly rankdir?: 'LR' | 'TB';
  readonly bgcolor?: string;
}

// ═══════════════════════════════════════════════════════════════
// SOCIAL NETWORK ANALYSIS
// ═══════════════════════════════════════════════════════════════

interface SocialNetworkResult {
  readonly nodes: readonly SocialNetworkNodeDTO[];
  readonly edges: readonly SocialNetworkEdgeDTO[];
  readonly metrics: SocialNetworkMetricsDTO;
}

interface SocialNetworkNodeDTO {
  readonly id: string;
  readonly label: string;
  readonly weight: number;
}

interface SocialNetworkEdgeDTO {
  readonly source: string;
  readonly target: string;
  readonly weight: number;
}

interface SocialNetworkMetricsDTO {
  readonly density: number;
  readonly centralityScores: Record<string, number>;
}

// ═══════════════════════════════════════════════════════════════
// PERFORMANCE ANALYSIS
// ═══════════════════════════════════════════════════════════════

interface SojournTimesResult {
  readonly byActivity: Record<string, DurationStatistics>;
}

interface WaitingTimesResult {
  readonly byTransition: Record<string, DurationStatistics>;
}

interface ServiceTimesResult {
  readonly byActivity: Record<string, DurationStatistics>;
}
```

---

## ADAPTER CONFIGURATION

```typescript
/**
 * Configuration for PM4Py adapter implementations.
 */
interface PM4PyAdapterConfig {
  // Connection
  readonly type: 'http' | 'grpc' | 'zeromq' | 'subprocess';
  readonly endpoint?: string;               // For http/grpc/zeromq
  readonly pythonPath?: string;             // For subprocess
  readonly scriptPath?: string;             // For subprocess
  
  // Performance
  readonly timeout: Duration;
  readonly maxConcurrency: number;
  readonly handleTTL: Duration;             // Auto-dispose handles after TTL
  
  // Retry
  readonly retryAttempts: number;
  readonly retryDelay: Duration;
  
  // Resource Limits
  readonly maxMemoryMB: number;
  readonly maxEventLogSize: number;
}

/**
 * Factory for creating PM4Py adapter instances.
 */
interface IPM4PyAdapterFactory {
  create(config: PM4PyAdapterConfig): IPM4PyAdapter;
  createPool(config: PM4PyAdapterConfig, poolSize: number): PM4PyAdapterPool;
}

interface PM4PyAdapterPool {
  acquire(): AsyncResult<IPM4PyAdapter>;
  release(adapter: IPM4PyAdapter): void;
  destroy(): AsyncResult<void>;
  getStats(): PoolStats;
}

interface PoolStats {
  readonly size: number;
  readonly available: number;
  readonly pending: number;
  readonly totalAcquired: number;
  readonly totalReleased: number;
}
```
