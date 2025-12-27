import type {
  AsyncResult,
  DataModelId,
  ProcessModelId,
  Duration,
  Percentage,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination } from "./common";

/**
 * Process discovery using PM4Py algorithms.
 * Supports both case-centric and object-centric discovery.
 */
export interface IProcessDiscoveryService extends IService {
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
  listProcessModels(input: ListDiscoveryModelsInput, ctx: OperationContext): AsyncResult<PaginatedResult<ProcessModel>>;

  // Conversion
  convertModel(input: ConvertModelInput, ctx: OperationContext): AsyncResult<ProcessModelContent>;

  // Export
  exportModel(input: ExportDiscoveryModelInput, ctx: OperationContext): AsyncResult<ExportedModel>;

  // Comparison
  compareModels(input: CompareModelsInput, ctx: OperationContext): AsyncResult<ModelComparison>;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type DiscoveryAlgorithm =
  | 'alpha_miner' | 'alpha_plus_miner'
  | 'inductive_miner' | 'inductive_miner_infrequent'
  | 'heuristics_miner' | 'ilp_miner' | 'split_miner';

export type ModelFormat = 'petri_net' | 'bpmn' | 'process_tree' | 'dfg' | 'ocel_petri_net';

export type ModelSource = 'discovered' | 'imported' | 'manual';

export type DiscoveryExportFormat = 'pnml' | 'bpmn' | 'svg' | 'png' | 'dot' | 'json';

export type DFGAggregation = 'frequency' | 'performance' | 'both';

// ═══════════════════════════════════════════════════════════════
// Core Model Types
// ═══════════════════════════════════════════════════════════════

export interface ProcessModel {
  readonly id: ProcessModelId;
  readonly dataModelId: DataModelId;
  readonly name: string;
  readonly description?: string;
  readonly format: ModelFormat;
  readonly source: ModelSource;
  readonly content: ProcessModelContent;
  readonly metadata: ProcessModelMetadata;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProcessModelContent {
  readonly format: ModelFormat;
  readonly data: unknown;  // Format-specific model data
}

export interface ProcessModelMetadata {
  readonly algorithm?: DiscoveryAlgorithm;
  readonly parameters?: Record<string, unknown>;
  readonly statistics?: DiscoveryStatistics;
}

export interface DirectlyFollowsGraph {
  readonly nodes: readonly DFGNode[];
  readonly edges: readonly DFGEdge[];
  readonly startActivities: readonly string[];
  readonly endActivities: readonly string[];
}

export interface DFGNode {
  readonly activity: string;
  readonly frequency: number;
  readonly performance?: DFGNodePerformance;
}

export interface DFGNodePerformance {
  readonly avgDuration: Duration;
  readonly minDuration: Duration;
  readonly maxDuration: Duration;
}

export interface DFGEdge {
  readonly source: string;
  readonly target: string;
  readonly frequency: number;
  readonly performance?: DFGEdgePerformance;
}

export interface DFGEdgePerformance {
  readonly avgDuration: Duration;
  readonly minDuration: Duration;
  readonly maxDuration: Duration;
}

export interface OCELPetriNet {
  readonly objectTypes: readonly string[];
  readonly places: readonly OCELPlace[];
  readonly transitions: readonly OCELTransition[];
  readonly arcs: readonly OCELArc[];
}

export interface OCELPlace {
  readonly id: string;
  readonly objectType: string;
  readonly name?: string;
}

export interface OCELTransition {
  readonly id: string;
  readonly activity: string;
  readonly objectTypes: readonly string[];
  readonly silent: boolean;
}

export interface OCELArc {
  readonly source: string;
  readonly target: string;
  readonly objectType: string;
  readonly weight: number;
}

export interface OCELFilter {
  readonly type: 'activity' | 'object_type' | 'time_range' | 'attribute' | 'variant';
  readonly config: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface DiscoverProcessInput {
  readonly dataModelId: DataModelId;
  readonly algorithm: DiscoveryAlgorithm;
  readonly parameters?: DiscoveryParameters;
  readonly filters?: readonly OCELFilter[];
  readonly outputFormat?: ModelFormat;
  readonly saveName?: string;                 // Auto-save if provided
}

export interface DiscoveryParameters {
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

export interface ActivityFilterConfig {
  readonly minFrequency?: number;
  readonly minPercentage?: Percentage;
  readonly excludeActivities?: readonly string[];
}

export interface EdgeFilterConfig {
  readonly minFrequency?: number;
  readonly minPercentage?: Percentage;
}

export interface DiscoveryResult {
  readonly processModel: ProcessModel;
  readonly statistics: DiscoveryStatistics;
  readonly warnings?: readonly string[];
  readonly duration: Duration;
}

export interface DiscoveryStatistics {
  readonly eventsProcessed: number;
  readonly casesProcessed: number;
  readonly activitiesDiscovered: number;
  readonly transitionsDiscovered: number;
  readonly placesDiscovered?: number;        // For Petri nets
  readonly silentTransitions?: number;
}

export interface DiscoverDFGInput {
  readonly dataModelId: DataModelId;
  readonly filters?: readonly OCELFilter[];
  readonly performanceMetrics?: boolean;
  readonly aggregation?: DFGAggregation;
}

export interface DFGResult {
  readonly dfg: DirectlyFollowsGraph;
  readonly statistics: DFGStatistics;
  readonly duration: Duration;
}

export interface DFGStatistics {
  readonly totalActivities: number;
  readonly totalEdges: number;
  readonly totalEvents: number;
  readonly avgOutDegree: number;
  readonly avgInDegree: number;
  readonly maxPathLength?: number;
}

export interface DiscoverOCPNInput {
  readonly dataModelId: DataModelId;
  readonly objectTypes: readonly string[];
  readonly filters?: readonly OCELFilter[];
  readonly algorithm?: 'basic' | 'extended';
}

export interface OCPNResult {
  readonly model: OCELPetriNet;
  readonly objectTypeStatistics: Record<string, ObjectTypeDiscoveryStats>;
  readonly duration: Duration;
}

export interface ObjectTypeDiscoveryStats {
  readonly objectCount: number;
  readonly eventCount: number;
  readonly placesDiscovered: number;
  readonly transitionsDiscovered: number;
}

export interface SaveProcessModelInput {
  readonly dataModelId: DataModelId;
  readonly name: string;
  readonly description?: string;
  readonly content: ProcessModelContent;
  readonly metadata?: Partial<ProcessModelMetadata>;
}

export interface UpdateDiscoveryModelInput {
  readonly id: ProcessModelId;
  readonly name?: string;
  readonly description?: string;
}

export interface ListDiscoveryModelsInput {
  readonly dataModelId?: DataModelId;
  readonly format?: ModelFormat;
  readonly source?: ModelSource;
  readonly search?: string;
  readonly pagination?: Pagination;
}

export interface ConvertModelInput {
  readonly modelId: ProcessModelId;
  readonly targetFormat: ModelFormat;
}

export interface ExportDiscoveryModelInput {
  readonly modelId: ProcessModelId;
  readonly format: DiscoveryExportFormat;
  readonly options?: DiscoveryExportOptions;
}

export interface DiscoveryExportOptions {
  readonly includeLayout?: boolean;
  readonly includeStatistics?: boolean;
  readonly imageWidth?: number;
  readonly imageHeight?: number;
  readonly theme?: 'light' | 'dark';
}

export interface ExportedModel {
  readonly content: string | ArrayBuffer;
  readonly mimeType: string;
  readonly filename: string;
}

export interface CompareModelsInput {
  readonly modelAId: ProcessModelId;
  readonly modelBId: ProcessModelId;
}

export interface ModelComparison {
  readonly similarity: number;
  readonly addedElements: readonly ModelElement[];
  readonly removedElements: readonly ModelElement[];
  readonly modifiedElements: readonly ModifiedElement[];
}

export interface ModelElement {
  readonly type: 'place' | 'transition' | 'arc';
  readonly id: string;
  readonly label?: string;
}

export interface ModifiedElement {
  readonly element: ModelElement;
  readonly changes: Record<string, { before: unknown; after: unknown }>;
}

// Alias for UpdateProcessModelInput to avoid conflicts
export { UpdateDiscoveryModelInput as UpdateProcessModelInput };
