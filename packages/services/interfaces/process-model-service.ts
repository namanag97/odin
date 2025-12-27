import type {
  AsyncResult,
  DataModelId,
  ProcessModelId,
  VariantId,
  CaseId,
  UUID,
  ISODateTime,
  Duration,
  Percentage,
} from "@odin/core-contracts";
import type { ProcessModel, Variant } from "@odin/domain";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination, SortConfig } from "./common";

export interface IProcessModelService extends IService {
  // Queries
  getProcessModel(id: ProcessModelId, ctx: OperationContext): AsyncResult<ProcessModel>;
  listProcessModels(input: ListProcessModelsInput, ctx: OperationContext): AsyncResult<PaginatedResult<ProcessModel>>;
  getModelStatistics(id: ProcessModelId, ctx: OperationContext): AsyncResult<ProcessModelStatistics>;

  // Discovery
  discoverProcess(input: DiscoverProcessInput, ctx: OperationContext): AsyncResult<DiscoveryJob>;
  getDiscoveryStatus(jobId: UUID, ctx: OperationContext): AsyncResult<DiscoveryJob>;
  cancelDiscovery(jobId: UUID, ctx: OperationContext): AsyncResult<void>;

  // Commands
  createProcessModel(input: CreateProcessModelInput, ctx: OperationContext): AsyncResult<ProcessModel>;
  updateProcessModel(input: UpdateProcessModelInput, ctx: OperationContext): AsyncResult<ProcessModel>;
  deleteProcessModel(id: ProcessModelId, ctx: OperationContext): AsyncResult<void>;

  // Conformance
  checkConformance(input: ConformanceCheckInput, ctx: OperationContext): AsyncResult<ConformanceJob>;
  getConformanceResults(modelId: ProcessModelId, ctx: OperationContext): AsyncResult<ConformanceResults>;

  // Variants
  getVariants(modelId: ProcessModelId, input: GetVariantsInput, ctx: OperationContext): AsyncResult<PaginatedResult<Variant>>;
  getVariantDetails(variantId: VariantId, ctx: OperationContext): AsyncResult<VariantDetails>;

  // Export
  exportModel(input: ExportModelInput, ctx: OperationContext): AsyncResult<ExportResult>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export type ProcessModelType = 'petri_net' | 'bpmn' | 'process_tree' | 'dfg' | 'ocel_petri_net';
export type ModelStatus = 'draft' | 'active' | 'archived';
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ModelConfiguration {
  readonly parameters: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
}

export interface CreateProcessModelInput {
  readonly dataModelId: DataModelId;
  readonly name: string;
  readonly description?: string;
  readonly modelType: ProcessModelType;
  readonly configuration?: ModelConfiguration;
}

export interface UpdateProcessModelInput {
  readonly id: ProcessModelId;
  readonly name?: string;
  readonly description?: string;
  readonly configuration?: Partial<ModelConfiguration>;
}

export interface ListProcessModelsInput {
  readonly dataModelId?: DataModelId;
  readonly modelType?: ProcessModelType;
  readonly status?: ModelStatus;
  readonly search?: string;
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

export interface DiscoverProcessInput {
  readonly dataModelId: DataModelId;
  readonly algorithm: DiscoveryAlgorithm;
  readonly parameters: AlgorithmParameters;
  readonly saveTo?: ProcessModelId;
}

export type DiscoveryAlgorithm =
  | 'alpha_miner' | 'heuristics_miner' | 'inductive_miner'
  | 'split_miner' | 'ilp_miner';

export interface AlgorithmParameters {
  readonly dependency_threshold?: number;
  readonly noise_threshold?: number;
  readonly activity_threshold?: number;
  readonly path_threshold?: number;
  readonly variant_percentage?: Percentage;
  readonly max_variants?: number;
}

export interface DiscoveryJob {
  readonly id: UUID;
  readonly dataModelId: DataModelId;
  readonly algorithm: DiscoveryAlgorithm;
  readonly status: ExecutionStatus;
  readonly progress: DiscoveryProgress;
  readonly result?: ProcessModel;
  readonly error?: string;
  readonly startedAt: ISODateTime;
  readonly completedAt?: ISODateTime;
}

export interface DiscoveryProgress {
  readonly phase: 'initializing' | 'analyzing' | 'discovering' | 'optimizing' | 'finalizing';
  readonly percentage: Percentage;
  readonly variantsAnalyzed?: number;
  readonly activitiesFound?: number;
}

export interface ConformanceCheckInput {
  readonly modelId: ProcessModelId;
  readonly dataModelId: DataModelId;
  readonly method: ConformanceMethod;
  readonly options?: ConformanceOptions;
}

export type ConformanceMethod = 'token_replay' | 'alignments' | 'footprints';

export interface ConformanceOptions {
  readonly sampleSize?: number;
  readonly computeDiagnostics?: boolean;
  readonly aggregationLevel?: 'case' | 'variant' | 'overall';
}

export interface ConformanceJob {
  readonly id: UUID;
  readonly modelId: ProcessModelId;
  readonly status: ExecutionStatus;
  readonly progress: ConformanceProgress;
  readonly results?: ConformanceResults;
  readonly error?: string;
  readonly startedAt: ISODateTime;
  readonly completedAt?: ISODateTime;
}

export interface ConformanceProgress {
  readonly casesProcessed: number;
  readonly totalCases: number;
  readonly percentage: Percentage;
}

export interface ConformanceResults {
  readonly fitness: Percentage;
  readonly precision: Percentage;
  readonly generalization: Percentage;
  readonly simplicity: Percentage;
  readonly caseResults?: readonly CaseConformance[];
  readonly diagnostics?: ConformanceDiagnostics;
}

export interface CaseConformance {
  readonly caseId: CaseId;
  readonly fitness: Percentage;
  readonly violations: readonly ConformanceViolation[];
}

export interface ConformanceViolation {
  readonly type: 'missing_token' | 'remaining_token' | 'incorrect_activity';
  readonly activity: string;
  readonly timestamp: ISODateTime;
  readonly severity: 'low' | 'medium' | 'high';
}

export interface ConformanceDiagnostics {
  readonly avgCaseFitness: Percentage;
  readonly fittingCases: number;
  readonly totalViolations: number;
  readonly commonViolations: readonly ViolationSummary[];
}

export interface ViolationSummary {
  readonly type: string;
  readonly activity: string;
  readonly count: number;
  readonly percentage: Percentage;
}

export interface GetVariantsInput {
  readonly minFrequency?: number;
  readonly maxVariants?: number;
  readonly sortBy?: 'frequency' | 'duration' | 'cost';
  readonly pagination?: Pagination;
}

export interface VariantDetails extends Variant {
  readonly cases: readonly CaseId[];
  readonly pathVisualization: ProcessPath;
  readonly bottlenecks: readonly Bottleneck[];
  readonly statistics: VariantStatistics;
}

export interface ProcessPath {
  readonly nodes: readonly PathNode[];
  readonly edges: readonly PathEdge[];
}

export interface PathNode {
  readonly id: string;
  readonly activity: string;
  readonly frequency: number;
}

export interface PathEdge {
  readonly source: string;
  readonly target: string;
  readonly frequency: number;
}

export interface Bottleneck {
  readonly fromActivity: string;
  readonly toActivity: string;
  readonly avgWaitTime: Duration;
  readonly cases: number;
  readonly severity: 'low' | 'medium' | 'high';
}

export interface VariantStatistics {
  readonly avgDuration: Duration;
  readonly minDuration: Duration;
  readonly maxDuration: Duration;
  readonly stdDevDuration: Duration;
  readonly avgCost?: number;
  readonly throughput: number;
}

export interface ExportModelInput {
  readonly modelId: ProcessModelId;
  readonly format: ExportFormat;
  readonly options?: ExportOptions;
}

export type ExportFormat = 'pnml' | 'bpmn' | 'xes' | 'dfg' | 'process_tree';

export interface ExportOptions {
  readonly includeStatistics?: boolean;
  readonly includeMetadata?: boolean;
  readonly beautify?: boolean;
}

export interface ExportResult {
  readonly fileId: UUID;
  readonly fileName: string;
  readonly format: ExportFormat;
  readonly size: number;
  readonly downloadUrl: string;
  readonly expiresAt: ISODateTime;
}

export interface ProcessModelStatistics {
  readonly totalActivities: number;
  readonly totalTransitions: number;
  readonly avgPathLength: number;
  readonly complexity: number;
  readonly variantStatistics: VariantStatistics;
  readonly performanceMetrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  readonly avgCaseDuration: Duration;
  readonly avgThroughput: number;
  readonly bottleneckCount: number;
  readonly parallelismScore: Percentage;
}
