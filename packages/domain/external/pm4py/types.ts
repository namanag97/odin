/**
 * PM4Py Adapter TypeScript Type Definitions
 * Maps domain models to PM4Py Python bridge
 */

import type {
  Brand,
  Duration,
} from "@odin/core-contracts";

// ═══════════════════════════════════════════════════════════════
// HANDLES (Pointers to Python Objects)
// ═══════════════════════════════════════════════════════════════

export type EventLogHandle = Brand<string, "EventLogHandle">;
export type OCELHandle = Brand<string, "OCELHandle">;
export type PetriNetHandle = Brand<string, "PetriNetHandle">;
export type ProcessTreeHandle = Brand<string, "ProcessTreeHandle">;

export const asEventLogHandle = (id: string): EventLogHandle =>
  id as EventLogHandle;
export const asOCELHandle = (id: string): OCELHandle => id as OCELHandle;
export const asPetriNetHandle = (id: string): PetriNetHandle =>
  id as PetriNetHandle;
export const asProcessTreeHandle = (id: string): ProcessTreeHandle =>
  id as ProcessTreeHandle;

// ═══════════════════════════════════════════════════════════════
// STATUS & VERSION
// ═══════════════════════════════════════════════════════════════

export interface PM4PyStatus {
  readonly healthy: boolean;
  readonly uptime: Duration;
  readonly activeHandles: number;
  readonly memoryUsage: number;
  readonly queuedTasks: number;
}

export interface PM4PyVersion {
  readonly pm4py: string;
  readonly python: string;
  readonly dependencies: Record<string, string>;
}

// ═══════════════════════════════════════════════════════════════
// EVENT LOG INPUT
// ═══════════════════════════════════════════════════════════════

export interface LoadEventLogInput {
  readonly data: EventLogData;
  readonly caseIdColumn: string;
  readonly activityColumn: string;
  readonly timestampColumn: string;
  readonly sortingColumn?: string;
  readonly additionalColumns?: readonly string[];
}

export type EventLogData =
  | {
      type: "dataframe";
      rows: readonly Record<string, unknown>[];
      columns: readonly string[];
    }
  | { type: "csv"; content: string; delimiter?: string }
  | { type: "xes"; content: string }
  | { type: "parquet"; content: Uint8Array };

export interface LoadOCELInput {
  readonly format: "json" | "xml" | "sqlite";
  readonly content: string | Uint8Array;
}

// ═══════════════════════════════════════════════════════════════
// DISCOVERY INPUT TYPES
// ═══════════════════════════════════════════════════════════════

export interface DiscoverAlphaInput {
  readonly eventLogHandle: EventLogHandle;
}

export interface DiscoverAlphaPlusInput {
  readonly eventLogHandle: EventLogHandle;
}

export interface DiscoverInductiveInput {
  readonly eventLogHandle: EventLogHandle;
  readonly noiseThreshold?: number; // 0.0 - 1.0, default 0.0
}

export interface DiscoverInductiveInfrequentInput {
  readonly eventLogHandle: EventLogHandle;
  readonly noiseThreshold: number; // 0.0 - 1.0, typically 0.2
}

export interface DiscoverHeuristicInput {
  readonly eventLogHandle: EventLogHandle;
  readonly dependencyThreshold?: number; // Default 0.5
  readonly andThreshold?: number; // Default 0.65
  readonly loopTwoThreshold?: number; // Default 0.5
  readonly minActivityCount?: number;
  readonly minDfgOccurrences?: number;
}

export interface DiscoverILPInput {
  readonly eventLogHandle: EventLogHandle;
  readonly alpha?: number; // Default 1.0
}

export interface DiscoverDFGInput {
  readonly eventLogHandle: EventLogHandle;
  readonly includePerformance?: boolean;
  readonly activityKey?: string;
  readonly timestampKey?: string;
}

export interface DiscoverOCPNInput {
  readonly ocelHandle: OCELHandle;
}

export interface DiscoverOCDFGInput {
  readonly ocelHandle: OCELHandle;
  readonly objectTypes?: readonly string[];
}

// ═══════════════════════════════════════════════════════════════
// PETRI NET RESULT
// ═══════════════════════════════════════════════════════════════

export interface PetriNetResult {
  readonly handle: PetriNetHandle;
  readonly petriNet: PetriNetDTO;
  readonly initialMarking: MarkingDTO;
  readonly finalMarking: MarkingDTO;
  readonly statistics: DiscoveryStatistics;
}

export interface PetriNetDTO {
  readonly places: readonly PlaceDTO[];
  readonly transitions: readonly TransitionDTO[];
  readonly arcs: readonly ArcDTO[];
}

export interface PlaceDTO {
  readonly id: string;
  readonly name: string;
}

export interface TransitionDTO {
  readonly id: string;
  readonly name: string | null; // null = silent transition
  readonly label: string | null;
}

export interface ArcDTO {
  readonly source: string;
  readonly target: string;
  readonly weight: number;
}

export interface MarkingDTO {
  readonly tokens: Record<string, number>; // place_id -> count
}

// ═══════════════════════════════════════════════════════════════
// PROCESS TREE RESULT
// ═══════════════════════════════════════════════════════════════

export interface ProcessTreeResult {
  readonly handle: ProcessTreeHandle;
  readonly tree: ProcessTreeDTO;
  readonly statistics: DiscoveryStatistics;
}

export interface ProcessTreeDTO {
  readonly operator: ProcessTreeOperator | null;
  readonly label: string | null;
  readonly children: readonly ProcessTreeDTO[];
}

export type ProcessTreeOperator =
  | "sequence" // ->
  | "xor" // X
  | "parallel" // +
  | "loop" // *
  | "or"; // O

// ═══════════════════════════════════════════════════════════════
// DFG RESULT
// ═══════════════════════════════════════════════════════════════

export interface DFGResult {
  readonly activities: Record<string, number>;
  readonly startActivities: Record<string, number>;
  readonly endActivities: Record<string, number>;
  readonly edges: readonly DFGEdgeDTO[];
  readonly performance?: DFGPerformanceDTO;
}

export interface DFGEdgeDTO {
  readonly source: string;
  readonly target: string;
  readonly frequency: number;
}

export interface DFGPerformanceDTO {
  readonly edgePerformance: Record<string, EdgePerformanceDTO>;
}

export interface EdgePerformanceDTO {
  readonly mean: number;
  readonly median: number;
  readonly min: number;
  readonly max: number;
  readonly stdev: number;
}

// ═══════════════════════════════════════════════════════════════
// BPMN RESULT
// ═══════════════════════════════════════════════════════════════

export interface BPMNResult {
  readonly bpmn: BPMNDTO;
}

export interface BPMNDTO {
  readonly process: BPMNProcessDTO;
}

export interface BPMNProcessDTO {
  readonly id: string;
  readonly name: string;
  readonly nodes: readonly BPMNNodeDTO[];
  readonly flows: readonly BPMNFlowDTO[];
}

export interface BPMNNodeDTO {
  readonly id: string;
  readonly type: BPMNNodeType;
  readonly name?: string;
}

export type BPMNNodeType =
  | "startEvent"
  | "endEvent"
  | "task"
  | "exclusiveGateway"
  | "parallelGateway"
  | "inclusiveGateway";

export interface BPMNFlowDTO {
  readonly id: string;
  readonly sourceRef: string;
  readonly targetRef: string;
}

// ═══════════════════════════════════════════════════════════════
// OCPN RESULT
// ═══════════════════════════════════════════════════════════════

export interface OCPNResult {
  readonly objectTypes: readonly string[];
  readonly places: readonly OCPlaceDTO[];
  readonly transitions: readonly OCTransitionDTO[];
  readonly arcs: readonly OCArcDTO[];
}

export interface OCPlaceDTO {
  readonly id: string;
  readonly name: string;
  readonly objectType: string;
  readonly isInitial: boolean;
  readonly isFinal: boolean;
}

export interface OCTransitionDTO {
  readonly id: string;
  readonly name: string | null;
  readonly label: string | null;
  readonly silent: boolean;
}

export interface OCArcDTO {
  readonly source: string;
  readonly target: string;
  readonly objectType: string;
  readonly variable: boolean;
}

// ═══════════════════════════════════════════════════════════════
// OCDFS RESULT
// ═══════════════════════════════════════════════════════════════

export interface OCDFGResult {
  readonly objectTypes: readonly string[];
  readonly activities: Record<string, OCActivityStatsDTO>;
  readonly edges: readonly OCDFGEdgeDTO[];
}

export interface OCActivityStatsDTO {
  readonly frequency: number;
  readonly objectTypeCounts: Record<string, number>;
}

export interface OCDFGEdgeDTO {
  readonly source: string;
  readonly target: string;
  readonly objectType: string;
  readonly frequency: number;
}

// ═══════════════════════════════════════════════════════════════
// DISCOVERY STATISTICS
// ═══════════════════════════════════════════════════════════════

export interface DiscoveryStatistics {
  readonly eventsProcessed: number;
  readonly casesProcessed: number;
  readonly activitiesFound: number;
  readonly transitionsCreated: number;
  readonly placesCreated?: number;
  readonly silentTransitions?: number;
  readonly executionTime: number; // milliseconds
}

// ═══════════════════════════════════════════════════════════════
// CONFORMANCE - TOKEN-BASED REPLAY
// ═══════════════════════════════════════════════════════════════

export interface TokenReplayInput {
  readonly eventLogHandle: EventLogHandle;
  readonly petriNetHandle: PetriNetHandle;
  readonly initialMarking: MarkingDTO;
  readonly finalMarking: MarkingDTO;
}

export interface TokenReplayResult {
  readonly traceFitness: number;
  readonly logFitness: number;
  readonly percentageFitTraces: number;
  readonly traceResults: readonly TraceReplayResultDTO[];
}

export interface TraceReplayResultDTO {
  readonly caseId: string;
  readonly fitness: number;
  readonly isFit: boolean;
  readonly missingTokens: number;
  readonly consumedTokens: number;
  readonly remainingTokens: number;
  readonly producedTokens: number;
}

// ═══════════════════════════════════════════════════════════════
// CONFORMANCE - ALIGNMENTS
// ═══════════════════════════════════════════════════════════════

export interface AlignmentsInput {
  readonly eventLogHandle: EventLogHandle;
  readonly petriNetHandle: PetriNetHandle;
  readonly initialMarking: MarkingDTO;
  readonly finalMarking: MarkingDTO;
  readonly costFunction?: CostFunctionDTO;
  readonly maxTraces?: number;
}

export interface CostFunctionDTO {
  readonly standardMoveOnLog: number;
  readonly standardMoveOnModel: number;
  readonly synchronousMoveCost: number;
  readonly activityCosts?: Record<string, ActivityCostDTO>;
}

export interface ActivityCostDTO {
  readonly moveOnLog: number;
  readonly moveOnModel: number;
}

export interface AlignmentsResult {
  readonly fitness: number;
  readonly averageCost: number;
  readonly alignments: readonly AlignmentDTO[];
}

export interface AlignmentDTO {
  readonly caseId: string;
  readonly alignment: readonly AlignmentMoveDTO[];
  readonly cost: number;
  readonly fitness: number;
  readonly bwc: number; // Best worst cost
}

export interface AlignmentMoveDTO {
  readonly logMove: string | null;
  readonly modelMove: string | null;
  readonly moveType: AlignmentMoveType;
}

export type AlignmentMoveType =
  | "sync" // Log and model agree
  | "log" // Move on log only (deviation)
  | "model" // Move on model only (missing)
  | "silent"; // Silent transition fired

// ═══════════════════════════════════════════════════════════════
// CONFORMANCE - FOOTPRINTS
// ═══════════════════════════════════════════════════════════════

export interface FootprintsInput {
  readonly eventLogHandle: EventLogHandle;
  readonly petriNetHandle: PetriNetHandle;
}

export interface FootprintsResult {
  readonly logFootprint: FootprintDTO;
  readonly modelFootprint: FootprintDTO;
  readonly conformanceMatrix: FootprintConformanceDTO;
}

export interface FootprintDTO {
  readonly activities: readonly string[];
  readonly directlyFollows: readonly [string, string][];
  readonly parallelRelations: readonly [string, string][];
  readonly causalRelations: readonly [string, string][];
  readonly neverFollow: readonly [string, string][];
}

export interface FootprintConformanceDTO {
  readonly fitness: number;
  readonly deviations: readonly FootprintDeviationDTO[];
}

export interface FootprintDeviationDTO {
  readonly activityA: string;
  readonly activityB: string;
  readonly logRelation: string;
  readonly modelRelation: string;
}

// ═══════════════════════════════════════════════════════════════
// QUALITY METRICS
// ═══════════════════════════════════════════════════════════════

export interface FitnessInput {
  readonly eventLogHandle: EventLogHandle;
  readonly petriNetHandle: PetriNetHandle;
  readonly initialMarking: MarkingDTO;
  readonly finalMarking: MarkingDTO;
  readonly method: "token_replay" | "alignments";
}

export interface FitnessResult {
  readonly fitness: number;
  readonly method: string;
  readonly details: FitnessDetailsDTO;
}

export interface FitnessDetailsDTO {
  readonly percentageFitTraces: number;
  readonly averageTraceFitness: number;
  readonly logFitness?: number;
  readonly modelFitness?: number;
}

export interface PrecisionInput {
  readonly eventLogHandle: EventLogHandle;
  readonly petriNetHandle: PetriNetHandle;
  readonly initialMarking: MarkingDTO;
  readonly finalMarking: MarkingDTO;
  readonly method: "etconformance" | "align_etconformance";
}

export interface PrecisionResult {
  readonly precision: number;
  readonly method: string;
}

export interface GeneralizationInput {
  readonly eventLogHandle: EventLogHandle;
  readonly petriNetHandle: PetriNetHandle;
  readonly initialMarking: MarkingDTO;
  readonly finalMarking: MarkingDTO;
}

export interface GeneralizationResult {
  readonly generalization: number;
}

export interface SimplicityInput {
  readonly petriNetHandle: PetriNetHandle;
}

export interface SimplicityResult {
  readonly simplicity: number;
  readonly places: number;
  readonly transitions: number;
  readonly arcs: number;
  readonly silentTransitions: number;
}

// ═══════════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════════

export interface ActivityFrequencies {
  readonly activities: Record<string, number>;
}

export interface GetVariantsInput {
  readonly eventLogHandle: EventLogHandle;
  readonly maxVariants?: number;
}

export interface VariantsResult {
  readonly variants: readonly VariantDTO[];
  readonly totalCases: number;
}

export interface VariantDTO {
  readonly activities: readonly string[];
  readonly count: number;
  readonly percentage: number;
}

export interface CaseDurationsInput {
  readonly eventLogHandle: EventLogHandle;
}

export interface DurationStatistics {
  readonly mean: number;
  readonly median: number;
  readonly min: number;
  readonly max: number;
  readonly stdev: number;
  readonly percentiles: Record<number, number>;
}

export interface OCELStatistics {
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

export interface FilterActivitiesInput {
  readonly eventLogHandle: EventLogHandle;
  readonly activities: readonly string[];
  readonly mode: "keep" | "remove";
}

export interface FilterTimeRangeInput {
  readonly eventLogHandle: EventLogHandle;
  readonly start: string;
  readonly end: string;
}

export interface FilterVariantsInput {
  readonly eventLogHandle: EventLogHandle;
  readonly variants: readonly (readonly string[])[];
  readonly mode: "keep" | "remove";
}

export interface FilterAttributesInput {
  readonly eventLogHandle: EventLogHandle;
  readonly attribute: string;
  readonly values: readonly unknown[];
  readonly mode: "keep" | "remove";
}

export interface FlattenOCELInput {
  readonly ocelHandle: OCELHandle;
  readonly objectType: string;
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export interface ExportSVGInput {
  readonly type: "petri_net" | "process_tree" | "dfg" | "bpmn";
  readonly handle?: string;
  readonly dto?: PetriNetDTO | ProcessTreeDTO | DFGResult | BPMNDTO;
  readonly options?: VisualizationOptions;
}

export interface ExportPNGInput extends ExportSVGInput {
  readonly width?: number;
  readonly height?: number;
  readonly dpi?: number;
}

export interface VisualizationOptions {
  readonly showFrequency?: boolean;
  readonly showPerformance?: boolean;
  readonly rankdir?: "LR" | "TB";
  readonly bgcolor?: string;
}

// ═══════════════════════════════════════════════════════════════
// SOCIAL NETWORK ANALYSIS
// ═══════════════════════════════════════════════════════════════

export interface SocialNetworkResult {
  readonly nodes: readonly SocialNetworkNodeDTO[];
  readonly edges: readonly SocialNetworkEdgeDTO[];
  readonly metrics: SocialNetworkMetricsDTO;
}

export interface SocialNetworkNodeDTO {
  readonly id: string;
  readonly label: string;
  readonly weight: number;
}

export interface SocialNetworkEdgeDTO {
  readonly source: string;
  readonly target: string;
  readonly weight: number;
}

export interface SocialNetworkMetricsDTO {
  readonly density: number;
  readonly centralityScores: Record<string, number>;
}

// ═══════════════════════════════════════════════════════════════
// PERFORMANCE ANALYSIS
// ═══════════════════════════════════════════════════════════════

export interface SojournTimesResult {
  readonly byActivity: Record<string, DurationStatistics>;
}

export interface WaitingTimesResult {
  readonly byTransition: Record<string, DurationStatistics>;
}

export interface ServiceTimesResult {
  readonly byActivity: Record<string, DurationStatistics>;
}

// ═══════════════════════════════════════════════════════════════
// ADAPTER CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export interface PM4PyAdapterConfig {
  // Connection
  readonly type: "http" | "grpc" | "zeromq" | "subprocess";
  readonly endpoint?: string; // For http/grpc/zeromq
  readonly pythonPath?: string; // For subprocess
  readonly scriptPath?: string; // For subprocess

  // Performance
  readonly timeout: Duration;
  readonly maxConcurrency: number;
  readonly handleTTL: Duration; // Auto-dispose handles after TTL

  // Retry
  readonly retryAttempts: number;
  readonly retryDelay: Duration;

  // Resource Limits
  readonly maxMemoryMB: number;
  readonly maxEventLogSize: number;
}

export interface IPM4PyAdapterFactory {
  create(config: PM4PyAdapterConfig): unknown; // Returns IPM4PyAdapter
  createPool(config: PM4PyAdapterConfig, poolSize: number): PM4PyAdapterPool;
}

export interface PM4PyAdapterPool {
  acquire(): Promise<unknown>; // Returns IPM4PyAdapter
  release(adapter: unknown): void;
  destroy(): Promise<void>;
  getStats(): PoolStats;
}

export interface PoolStats {
  readonly size: number;
  readonly available: number;
  readonly pending: number;
  readonly totalAcquired: number;
  readonly totalReleased: number;
}
